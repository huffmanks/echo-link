import { Link } from "@tanstack/react-router";
import { HashIcon } from "lucide-react";

import { useBulkSelectionStore } from "@/lib/store/bulk-selection";
import { useSettingsStore } from "@/lib/store/settings";
import { cn } from "@/lib/utils";
import type { View } from "@/types";

import { Badge, type BadgeVariants } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TagCellProps {
  tags: Array<string>;
  handleOpenChange: (open: boolean) => void;
  variant?: BadgeVariants["variant"];
  view?: View;
}

export default function TagCell({
  tags,
  handleOpenChange,
  variant = "secondary",
  view,
}: TagCellProps) {
  const isBulkSelecting = useBulkSelectionStore((state) => state.isBulkSelecting);
  const limit = useSettingsStore((state) => state.limit);

  if (tags.length === 0) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "text-muted-foreground border-dashed font-normal",
          isBulkSelecting && "opacity-70"
        )}>
        No tags
      </Badge>
    );
  }

  const isGridView = view === "grid";
  const hasMultipleTags = tags.length > 1;

  const hideFirstTagOnDesktop = isGridView && hasMultipleTags;

  return (
    <div className="flex flex-wrap items-center gap-1">
      <Badge
        variant={variant}
        className={cn(hideFirstTagOnDesktop && "sm:hidden")}
        render={
          <Link
            to="/dashboard/tags/$tagName"
            params={{ tagName: tags[0] }}
            search={{ limit }}
            tabIndex={isBulkSelecting ? -1 : 0}
            className={cn(isBulkSelecting && "pointer-events-none opacity-70")}
            onClick={() => handleOpenChange(false)}>
            <span className="inline-flex items-center gap-px">
              <HashIcon
                className={cn("size-3", variant === "invert" ? "text-muted" : "text-primary")}
              />
              <span>{tags[0]}</span>
            </span>
          </Link>
        }
      />

      {hasMultipleTags && (
        <DropdownMenu>
          <DropdownMenuTrigger
            nativeButton={false}
            disabled={isBulkSelecting}
            render={
              <Badge
                variant={variant}
                className={cn(
                  "cursor-pointer",
                  variant === "invert"
                    ? "hover:bg-primary focus-visible:bg-primary"
                    : "hover:bg-secondary/80",
                  isBulkSelecting && "pointer-events-none opacity-70"
                )}>
                {isGridView ? (
                  <>
                    <span className="sm:hidden">+{tags.length - 1} more</span>
                    <span className="hidden sm:inline">
                      {tags.length} {tags.length === 1 ? "tag" : "tags"}
                    </span>
                  </>
                ) : (
                  `+${tags.length - 1} more`
                )}
              </Badge>
            }></DropdownMenuTrigger>
          <DropdownMenuContent>
            {tags.map((tag, index) => {
              if (index === 0 && !isGridView) return null;

              return (
                <DropdownMenuItem
                  key={tag}
                  className="group"
                  render={
                    <Link
                      to="/dashboard/tags/$tagName"
                      params={{ tagName: tag }}
                      search={{ limit }}
                      className="w-full cursor-pointer"
                      onClick={() => handleOpenChange(false)}>
                      <span className="inline-flex gap-px">
                        <span className="text-primary group-hover:text-primary/90!">#</span>
                        <span>{tag}</span>
                      </span>
                    </Link>
                  }
                />
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
