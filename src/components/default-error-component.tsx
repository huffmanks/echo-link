import {
  type ErrorComponentProps,
  useCanGoBack,
  useLocation,
  useRouter,
} from "@tanstack/react-router";
import { DatabaseZapIcon } from "lucide-react";

import { useBackgroundSync } from "@/hooks/use-background-sync";
import { cn } from "@/lib/utils";

import FullScreenWrapper from "@/components/full-screen-wrapper";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function DefaultErrorComponent(props: ErrorComponentProps) {
  const { pathname } = useLocation();
  const { isOnline } = useBackgroundSync();

  const isDashboardRoute = pathname.startsWith("/dashboard");
  return (
    <FullScreenWrapper className={cn(!isDashboardRoute && "min-h-svh justify-center")}>
      {!isOnline ? <EmptyCache /> : <ErrorDisplay {...props} />}
    </FullScreenWrapper>
  );
}

export function EmptyCache() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <DatabaseZapIcon />
        </EmptyMedia>
        <EmptyTitle>You’re offline</EmptyTitle>
        <EmptyDescription>
          This page isn’t cached yet. Connect to the internet to view it.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button className="cursor-pointer" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}

function ErrorDisplay(props: ErrorComponentProps) {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  return (
    <>
      <h1 className="mb-3 font-mono text-2xl">{props.error.name}</h1>
      <p className="text-muted-foreground mb-6">{props.error.message}</p>
      <div className="flex items-center gap-4">
        {canGoBack && (
          <Button
            variant="secondary"
            className="cursor-pointer"
            onClick={() => router.history.back()}>
            Go back
          </Button>
        )}
        <Button className="cursor-pointer" onClick={() => props.reset()}>
          Reset
        </Button>
      </div>
    </>
  );
}
