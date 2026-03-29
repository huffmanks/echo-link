import { useBackgroundSync } from "@/hooks/use-background-sync";
import { cn } from "@/lib/utils";

interface OnlineStatusProps {
  isOnline: boolean;
  justIndicator?: boolean;
}

export function OnlineStatus({ isOnline, justIndicator = true }: OnlineStatusProps) {
  const { isSyncing } = useBackgroundSync();

  if (justIndicator) {
    return <IndicatorDot isOnline={isOnline} isSyncing={isSyncing} />;
  }

  return (
    <div className="relative flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
      <IndicatorDot isOnline={isOnline} isSyncing={isSyncing} isWithinLabel={true} />
      <span
        className={cn(
          !isOnline ? "text-rose-400" : isSyncing ? "text-amber-400" : "text-emerald-400"
        )}>
        {!isOnline ? "Offline" : isSyncing ? "Syncing..." : "Online"}
      </span>
    </div>
  );
}

function IndicatorDot({
  isOnline,
  isSyncing,
  isWithinLabel = false,
}: {
  isOnline: boolean;
  isSyncing: boolean;
  isWithinLabel?: boolean;
}) {
  return (
    <div className={cn("absolute", isWithinLabel ? "right-0 bottom-0" : "right-0.5 bottom-px")}>
      <span className="relative flex size-2">
        {(isOnline || isSyncing) && (
          <span
            className={cn(
              "absolute inline-flex size-full animate-ping rounded-full opacity-75",
              isSyncing ? "bg-amber-400" : "bg-emerald-400",
              isWithinLabel ? "animation-duration-[1500ms]" : "animation-duration-[5000ms]"
            )}></span>
        )}
        <span
          className={cn(
            "relative inline-flex size-2 rounded-full",
            !isOnline ? "bg-rose-500" : isSyncing ? "bg-amber-500" : "bg-emerald-500"
          )}></span>
      </span>
    </div>
  );
}
