"use client";

import { useEffect, useState } from "react";
import { useAutoReplyPolling } from "@/lib/telegram/use-auto-reply-polling";

export function TelegramAutoReplyProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<{
    connected: boolean;
    autoReplyEnabled: boolean;
  } | null>(null);

  // Check account status once on mount
  useEffect(() => {
    fetch("/api/telegram/user/status")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setStatus({
            connected: data.connected,
            autoReplyEnabled: data.autoReplyEnabled
          });
        }
      })
      .catch(() => {});
  }, []);

  // Run 24/7 polling when connected
  useAutoReplyPolling(
    status?.connected ?? false,
    status?.autoReplyEnabled ?? false,
    30000
  );

  return <>{children}</>;
}
