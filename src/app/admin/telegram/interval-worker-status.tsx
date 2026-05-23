import { CloudOff, Loader2 } from "lucide-react";

interface Props {
  connected: boolean;
  autoReplyEnabled: boolean;
  hasEdgeFunction: boolean;
}

export function IntervalWorkerStatus({ connected, autoReplyEnabled, hasEdgeFunction }: Props) {
  const active = connected && autoReplyEnabled && hasEdgeFunction;

  if (!connected) {
    return (
      <div>
        <div className="text-lg font-bold tracking-tight text-neutral-400">Inactive</div>
        <p className="mt-1 text-xs leading-5 text-neutral-400">Connect your personal account first</p>
      </div>
    );
  }

  if (!autoReplyEnabled) {
    return (
      <div>
        <div className="text-lg font-bold tracking-tight text-amber-600">Paused</div>
        <p className="mt-1 text-xs leading-5 text-neutral-400">Auto-reply is disabled</p>
      </div>
    );
  }

  if (!hasEdgeFunction) {
    return (
      <div>
        <div className="inline-flex items-center gap-1.5 text-lg font-bold tracking-tight text-amber-600">
          <CloudOff className="size-4" />
          Not Deployed
        </div>
        <p className="mt-1 text-xs leading-5 text-neutral-400">
          Deploy the Supabase Edge Function for 24/7 auto-reply
        </p>
      </div>
    );
  }

  if (!active) {
    return (
      <div>
        <div className="text-lg font-bold tracking-tight text-neutral-400">Waiting...</div>
        <p className="mt-1 text-xs leading-5 text-neutral-400">Edge function will activate on next cron tick</p>
      </div>
    );
  }

  return (
    <div>
      <div className="inline-flex items-center gap-1.5 text-lg font-bold tracking-tight text-emerald-600">
        <Loader2 className="size-4 animate-spin" />
        Running 24/7
      </div>
      <p className="mt-1 text-xs leading-5 text-neutral-400">
        Supabase Edge Function polls every 60s
      </p>
    </div>
  );
}
