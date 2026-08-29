import { useBackgroundSync } from "@/context/background-sync";
import { cn } from "@/lib/utils";

function getSyncStatus() {
  const { isConnected, isOnline, isSyncing } = useBackgroundSync();

  if (!isOnline) {
    return {
      label: "Offline",
      textColor: "text-rose-400",
      dotColor: "bg-rose-500",
      pingColor: "bg-rose-400",
    };
  }

  if (!isConnected) {
    return {
      label: "Disconnected",
      textColor: "text-rose-400",
      dotColor: "bg-rose-500",
      pingColor: "bg-rose-400",
    };
  }

  if (isSyncing) {
    return {
      label: "Syncing",
      textColor: "text-amber-400",
      dotColor: "bg-amber-500",
      pingColor: "bg-amber-400",
    };
  }

  return {
    label: "Connected",
    textColor: "text-emerald-400",
    dotColor: "bg-emerald-500",
    pingColor: "bg-emerald-400",
  };
}

export function OnlineStatus() {
  const status = getSyncStatus();

  return (
    <div className="relative flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
      <IndicatorDot isWithinLabel={true} />
      <span className={status.textColor}>{status.label}</span>
    </div>
  );
}

export function IndicatorDot({ isWithinLabel = false }: { isWithinLabel?: boolean }) {
  const status = getSyncStatus();

  return (
    <div className={cn("absolute", isWithinLabel ? "right-0 bottom-0" : "right-0.5 bottom-px")}>
      <span className="relative flex size-2">
        <span
          className={cn(
            "absolute inline-flex size-full animate-ping rounded-full opacity-75",
            status.pingColor,
            isWithinLabel ? "animation-duration-[1500ms]" : "animation-duration-[5000ms]"
          )}
        />
        <span className={cn("relative inline-flex size-2 rounded-full", status.dotColor)} />
      </span>
    </div>
  );
}
