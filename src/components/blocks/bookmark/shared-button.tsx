import { useState } from "react";

import { LockIcon, Share2Icon } from "lucide-react";
import { toast } from "sonner";

import { useBulkSelectionStore } from "@/lib/bulk-selection-store";
import { cn, getErrorMessage } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SharedButtonProps {
  title: string;
  text: string;
  url: string;
  isShared: boolean;
}

export default function SharedButton({ title, text, url, isShared }: SharedButtonProps) {
  const [isSharing, setIsSharing] = useState(false);

  const isBulkSelecting = useBulkSelectionStore((state) => state.isBulkSelecting);

  async function handleShare() {
    setIsSharing(true);
    const shareData = {
      title,
      text,
      url,
    };

    try {
      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
      }
    } finally {
      setIsSharing(false);
    }
  }
  return (
    <>
      {isShared ? (
        <Button
          tabIndex={isBulkSelecting ? -1 : 0}
          variant="ghost"
          size="icon-xs"
          disabled={isSharing || isBulkSelecting}
          nativeButton={false}
          className={cn(
            "border-border size-5.5 cursor-pointer rounded-full border",
            isBulkSelecting && "pointer-events-none"
          )}
          onClick={handleShare}
          render={
            <Badge size="icon" variant="outline">
              <Share2Icon
                className={cn(
                  "transition-colors",
                  isBulkSelecting ? "text-muted-foreground" : "text-primary"
                )}
              />
            </Badge>
          }
        />
      ) : (
        <Tooltip>
          <TooltipTrigger
            className="size-5.5"
            disabled={isBulkSelecting}
            tabIndex={isBulkSelecting ? -1 : 0}
            render={
              <Badge size="icon" variant="outline">
                <LockIcon
                  className={cn(
                    "transition-colors",
                    isBulkSelecting ? "text-muted-foreground" : "text-primary"
                  )}
                />
              </Badge>
            }
          />
          <TooltipContent>
            <p>Private</p>
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );
}
