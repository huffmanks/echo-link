import { Link } from "@tanstack/react-router";
import { HashIcon } from "lucide-react";

import { useBulkSelectionStore } from "@/lib/store/bulk-selection";
import { useSettingsStore } from "@/lib/store/settings";
import { cn } from "@/lib/utils";
import type { Tag } from "@/types";

import { Badge, type BadgeVariants } from "@/components/ui/badge";

interface TagCellProps {
  tag: Tag;
  variant?: BadgeVariants["variant"];
}

export default function TagCell({ tag, variant = "secondary" }: TagCellProps) {
  const isBulkSelecting = useBulkSelectionStore((state) => state.isBulkSelecting);
  const limit = useSettingsStore((state) => state.limit);

  return (
    <div className="flex flex-wrap items-center gap-1">
      <Badge
        variant={variant}
        render={
          <Link
            to="/dashboard/tags/$tagName"
            params={{ tagName: tag.name }}
            search={{ limit }}
            tabIndex={isBulkSelecting ? -1 : 0}
            className={cn(isBulkSelecting && "pointer-events-none opacity-70")}>
            <span className="inline-flex items-center gap-px">
              <HashIcon className="text-primary size-3" />
              <span>{tag.name}</span>
            </span>
          </Link>
        }
      />
    </div>
  );
}
