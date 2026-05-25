"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  UploadFolder,
  UploadJob,
  UploadJobScan
} from "./upload-progress-dialog";

const STORAGE_KEY = "babastore.uploadJobs.v1";
const POLL_INTERVAL_MS = 4000;

type StartResponse = {
  jobId: string;
  status: "clean" | "flagged" | "blocked" | "processing";
  publicUrl?: string;
  size?: number;
  sha256?: string;
  scan?: UploadJobScan;
  error?: string;
};

type StatusResponse = StartResponse;

function readPersisted(): UploadJob[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UploadJob[];
    return parsed.map((job) => ({
      ...job,
      status:
        job.status === "uploading" || job.status === "queued"
          ? "error"
          : job.status,
      error:
        job.status === "uploading" || job.status === "queued"
          ? "Upload was interrupted. Click Retry to upload again."
          : job.error
    }));
  } catch {
    return [];
  }
}

function persist(jobs: UploadJob[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  } catch {
    /* ignore quota errors */
  }
}

function uid() {
  return `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export type CompletedAsset = {
  jobId: string;
  folder: UploadFolder;
  fileName: string;
  fileSize: number;
  publicUrl: string;
  flagged?: boolean;
};

export function useUploadJobs(opts: {
  onAssetReady: (asset: CompletedAsset) => void;
}) {
  const [jobs, setJobs] = useState<UploadJob[]>([]);
  const [open, setOpen] = useState(false);
  const fileMap = useRef(new Map<string, File>());
  const announced = useRef(new Set<string>());
  const pollerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onAssetReadyRef = useRef(opts.onAssetReady);

  useEffect(() => {
    onAssetReadyRef.current = opts.onAssetReady;
  }, [opts.onAssetReady]);

  // Hydrate persisted jobs from localStorage. Required: localStorage isn't available
  // on the server, so we can't initialize useState from it directly — we have to
  // sync after mount. The React Compiler lint warning is a false positive here.
  useEffect(() => {
    const restored = readPersisted();
    if (!restored.length) return;
    setJobs(restored);
    const hasInteresting = restored.some(
      (j) => j.status !== "clean" && j.status !== "flagged" && j.status !== "blocked"
    );
    if (hasInteresting) setOpen(true);
    restored.forEach((job) => {
      const isAttachable =
        (job.status === "clean" || job.status === "flagged") && job.publicUrl;
      if (isAttachable && !announced.current.has(job.id)) {
        announced.current.add(job.id);
        onAssetReadyRef.current({
          jobId: job.id,
          folder: job.folder,
          fileName: job.fileName,
          fileSize: job.fileSize,
          publicUrl: job.publicUrl!,
          flagged: job.status === "flagged"
        });
      }
    });
  }, []);

  // Persist on change
  useEffect(() => {
    persist(jobs);
  }, [jobs]);

  // Poll status for any scanning job
  useEffect(() => {
    function tick() {
      setJobs((current) => {
        const scanning = current.filter(
          (j) => j.status === "scanning" && j.jobId
        );
        if (!scanning.length) return current;

        scanning.forEach((job) => {
          fetch(`/api/developer/uploads/status?jobId=${job.jobId}`)
            .then((r) => r.json())
            .then((payload: StatusResponse) => {
              setJobs((curr) =>
                curr.map((j) => {
                  if (j.id !== job.id) return j;
                  if (
                    (payload.status === "clean" || payload.status === "flagged") &&
                    payload.publicUrl
                  ) {
                    if (!announced.current.has(j.id)) {
                      announced.current.add(j.id);
                      onAssetReadyRef.current({
                        jobId: j.id,
                        folder: j.folder,
                        fileName: j.fileName,
                        fileSize: j.fileSize,
                        publicUrl: payload.publicUrl,
                        flagged: payload.status === "flagged"
                      });
                    }
                    return {
                      ...j,
                      status: payload.status,
                      publicUrl: payload.publicUrl,
                      scan: payload.scan,
                      finishedAt: Date.now()
                    };
                  }
                  if (payload.status === "blocked") {
                    return {
                      ...j,
                      status: "blocked",
                      scan: payload.scan,
                      finishedAt: Date.now()
                    };
                  }
                  return {
                    ...j,
                    scan: payload.scan ?? j.scan
                  };
                })
              );
            })
            .catch(() => {
              /* transient — keep polling */
            });
        });

        return current;
      });
    }

    if (pollerRef.current) clearInterval(pollerRef.current);
    pollerRef.current = setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      if (pollerRef.current) clearInterval(pollerRef.current);
    };
  }, []);

  // Declared first so `upload` below can reference it.
  const runUpload = useCallback(
    (id: string, file: File, folder: UploadFolder, packageName: string) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/developer/uploads/start");
      xhr.setRequestHeader(
        "Content-Type",
        file.type ||
          (folder === "apks"
            ? "application/vnd.android.package-archive"
            : "application/octet-stream")
      );
      xhr.setRequestHeader("x-file-name", encodeURIComponent(file.name));
      xhr.setRequestHeader("x-package-name", packageName);
      xhr.setRequestHeader("x-upload-folder", folder);

      setJobs((curr) =>
        curr.map((j) =>
          j.id === id ? { ...j, status: "uploading", bytesUploaded: 0 } : j
        )
      );

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        setJobs((curr) =>
          curr.map((j) =>
            j.id === id ? { ...j, bytesUploaded: event.loaded } : j
          )
        );
      };

      xhr.upload.onload = () => {
        setJobs((curr) =>
          curr.map((j) =>
            j.id === id ? { ...j, uploadDone: true, status: "scanning" } : j
          )
        );
      };

      xhr.onerror = () => {
        setJobs((curr) =>
          curr.map((j) =>
            j.id === id
              ? { ...j, status: "error", error: "Network error during upload." }
              : j
          )
        );
      };

      xhr.onload = () => {
        let payload: StartResponse | null = null;
        try {
          payload = JSON.parse(xhr.responseText) as StartResponse;
        } catch {
          payload = null;
        }

        if (xhr.status >= 200 && xhr.status < 300 && payload) {
          if (
            (payload.status === "clean" || payload.status === "flagged") &&
            payload.publicUrl
          ) {
            const flagged = payload.status === "flagged";
            if (!announced.current.has(id)) {
              announced.current.add(id);
              onAssetReadyRef.current({
                jobId: id,
                folder,
                fileName: file.name,
                fileSize: payload.size ?? file.size,
                publicUrl: payload.publicUrl,
                flagged
              });
            }
            const finalPayload = payload;
            setJobs((curr) =>
              curr.map((j) =>
                j.id === id
                  ? {
                      ...j,
                      jobId: finalPayload.jobId,
                      status: flagged ? "flagged" : "clean",
                      publicUrl: finalPayload.publicUrl,
                      scan: finalPayload.scan,
                      bytesUploaded: file.size,
                      uploadDone: true,
                      finishedAt: Date.now()
                    }
                  : j
              )
            );
            return;
          }

          if (payload.status === "processing") {
            const finalPayload = payload;
            setJobs((curr) =>
              curr.map((j) =>
                j.id === id
                  ? {
                      ...j,
                      jobId: finalPayload.jobId,
                      status: "scanning",
                      scan: finalPayload.scan,
                      bytesUploaded: file.size,
                      uploadDone: true
                    }
                  : j
              )
            );
            return;
          }

          if (payload.status === "blocked") {
            const finalPayload = payload;
            setJobs((curr) =>
              curr.map((j) =>
                j.id === id
                  ? {
                      ...j,
                      jobId: finalPayload.jobId,
                      status: "blocked",
                      scan: finalPayload.scan,
                      bytesUploaded: file.size,
                      uploadDone: true,
                      finishedAt: Date.now()
                    }
                  : j
              )
            );
            return;
          }
        }

        const message =
          payload?.error ??
          payload?.scan?.message ??
          `Upload failed (HTTP ${xhr.status}).`;
        const finalPayload = payload;
        setJobs((curr) =>
          curr.map((j) =>
            j.id === id
              ? {
                  ...j,
                  status: xhr.status === 422 ? "blocked" : "error",
                  scan: finalPayload?.scan,
                  error: message
                }
              : j
          )
        );
      };

      xhr.send(file);
    },
    []
  );

  const upload = useCallback(
    (file: File, folder: UploadFolder, packageName: string) => {
      const id = uid();
      const job: UploadJob = {
        id,
        folder,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        packageName,
        bytesUploaded: 0,
        uploadDone: false,
        status: "queued",
        startedAt: Date.now()
      };
      fileMap.current.set(id, file);
      setJobs((curr) => [job, ...curr]);
      setOpen(true);
      runUpload(id, file, folder, packageName);
      return id;
    },
    [runUpload]
  );

  const retry = useCallback(
    (id: string) => {
      // Use a state callback to avoid having `jobs` in the dep array (would force
      // recreation on every state change).
      setJobs((current) => {
        const job = current.find((j) => j.id === id);
        if (!job) return current;
        const file = fileMap.current.get(id);
        if (!file) {
          return current.map((j) =>
            j.id === id
              ? {
                  ...j,
                  error:
                    "Pick the file again to retry — it wasn't kept after refresh."
                }
              : j
          );
        }
        runUpload(id, file, job.folder, job.packageName);
        return current;
      });
    },
    [runUpload]
  );

  const dismiss = useCallback(() => setOpen(false), []);

  const removeJob = useCallback((id: string) => {
    setJobs((curr) => curr.filter((j) => j.id !== id));
    fileMap.current.delete(id);
  }, []);

  const clearCompleted = useCallback(() => {
    setJobs((curr) =>
      curr.filter(
        (j) =>
          j.status !== "clean" && j.status !== "blocked" && j.status !== "error"
      )
    );
  }, []);

  return { jobs, open, setOpen, upload, retry, dismiss, removeJob, clearCompleted };
}
