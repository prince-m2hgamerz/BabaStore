"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, ClipboardCopy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function AnnouncementsSetup() {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [sqlText, setSqlText] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleSetup() {
    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/setup/announcements", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setState("success");
        setTimeout(() => setState("idle"), 5000);
      } else {
        setState("error");
        setErrorMsg(data.error ?? "Unknown error");
        if (data.sql) setSqlText(data.sql);
      }
    } catch {
      setState("error");
      setErrorMsg("Failed to contact setup endpoint.");
    }
  }

  async function copySql() {
    if (!sqlText) return;
    try {
      await navigator.clipboard.writeText(sqlText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  if (state === "success") {
    return (
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="flex items-start gap-3 p-4 text-sm text-emerald-900">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          <div>
            <p className="font-medium">Table created successfully!</p>
            <p className="mt-1 text-emerald-700">The announcements table is ready. Refresh the page to start using it.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={state === "error" ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}>
      <CardContent className="flex items-start gap-3 p-4 text-sm">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-amber-900">
            Database table &quot;announcements&quot; may be missing
          </p>
          <p className="mt-1 text-amber-700">
            If you just deployed or updated the database schema, create the table to enable announcements.
          </p>
          {state === "error" && errorMsg ? (
            <p className="mt-2 rounded border border-red-200 bg-red-100 px-3 py-2 text-xs text-red-700">{errorMsg}</p>
          ) : null}
          {sqlText ? (
            <div className="mt-3">
              <p className="mb-2 text-xs font-medium text-amber-800">Run this SQL in your Supabase SQL Editor:</p>
              <pre className="overflow-x-auto rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                {sqlText}
              </pre>
              <Button size="sm" variant="secondary" type="button" onClick={copySql} className="mt-2">
                <ClipboardCopy className="size-3.5" />
                {copied ? "Copied!" : "Copy SQL"}
              </Button>
            </div>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" type="button" onClick={handleSetup} disabled={state === "loading"}>
              {state === "loading" ? "Creating table..." : "Retry auto-create"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
