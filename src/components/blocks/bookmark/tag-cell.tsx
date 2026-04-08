import { Link } from "@tanstack/react-router";

import { useBulkSelectionStore } from "@/lib/bulk-selection-store";
import { useSettingsStore } from "@/lib/store";
import { cn } from "@/lib/utils";

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
}

export default function TagCell({ tags, handleOpenChange, variant = "secondary" }: TagCellProps) {
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

  const visibleTags = tags.slice(0, 2);
  const remainingTags = tags.slice(2);

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visibleTags.map((tag) => (
        <Badge
          key={tag}
          variant={variant}
          render={
            <Link
              to="/dashboard/tags/$tagName"
              params={{ tagName: tag }}
              search={{ limit }}
              tabIndex={isBulkSelecting ? -1 : 0}
              className={cn(isBulkSelecting && "pointer-events-none opacity-70")}
              onClick={() => handleOpenChange(false)}>
              <span className="inline-flex gap-px">
                <span className={cn(variant === "invert" ? "text-muted" : "text-muted-foreground")}>
                  #
                </span>
                <span>{tag}</span>
              </span>
            </Link>
          }
        />
      ))}

      {remainingTags.length > 0 && (
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
                +{remainingTags.length} more
              </Badge>
            }></DropdownMenuTrigger>
          <DropdownMenuContent>
            {remainingTags.map((tag) => (
              <DropdownMenuItem
                key={tag}
                render={
                  <Link
                    to="/dashboard/tags/$tagName"
                    params={{ tagName: tag }}
                    search={{ limit }}
                    className="w-full cursor-pointer"
                    onClick={() => handleOpenChange(false)}>
                    <span className="inline-flex gap-px">
                      <span className="text-muted-foreground">#</span>
                      <span>{tag}</span>
                    </span>
                  </Link>
                }></DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
