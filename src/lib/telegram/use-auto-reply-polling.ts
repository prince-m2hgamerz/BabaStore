"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type PollStatus = {
  running: boolean;
  lastCheck: Date | null;
  lastReplied: number;
  lastChecked: number;
  lastError: string | null;
  checkedCount: number;
  repliedCount: number;
};

export function useAutoReplyPolling(connected: boolean, enabled: boolean, intervalMs = 30000) {
  const [status, setStatus] = useState<PollStatus>({
    running: false,
    lastCheck: null,
    lastReplied: 0,
    lastChecked: 0,
    lastError: null,
    checkedCount: 0,
    repliedCount: 0
  });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);
  const runningRef = useRef(false);

  const check = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    try {
      const res = await fetch("/api/telegram/user/check-messages", { method: "POST" });
      const data = await res.json();
      if (!mountedRef.current) return;
      setStatus((prev) => ({
        running: true,
        lastCheck: new Date(),
        lastReplied: data.replied ?? 0,
        lastChecked: data.checked ?? 0,
        lastError: data.error ?? null,
        checkedCount: prev.checkedCount + 1,
        repliedCount: prev.repliedCount + (data.replied ?? 0)
      }));
    } catch (err) {
      if (!mountedRef.current) return;
      setStatus((prev) => ({
        ...prev,
        running: true,
        lastCheck: new Date(),
        lastError: String(err)
      }));
    } finally {
      runningRef.current = false;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    if (!connected || !enabled) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setStatus({
        running: false,
        lastCheck: null,
        lastReplied: 0,
        lastChecked: 0,
        lastError: null,
        checkedCount: 0,
        repliedCount: 0
      });
      return;
    }

    // Start polling immediately, then every intervalMs
    check();
    timerRef.current = setInterval(check, intervalMs);

    return () => {
      mountedRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [connected, enabled, intervalMs, check]);

  return status;
}
