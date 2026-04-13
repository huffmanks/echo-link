import { Link } from "@tanstack/react-router";
import { FolderIcon } from "lucide-react";

import { useBulkSelectionStore } from "@/lib/store/bulk-selection";
import { useSettingsStore } from "@/lib/store/settings";
import { cn } from "@/lib/utils";
import type { Folder } from "@/types";

import { Badge, type BadgeVariants } from "@/components/ui/badge";

interface FolderCellProps {
  folder: Folder;
  variant?: BadgeVariants["variant"];
}

export default function FolderCell({ folder, variant = "secondary" }: FolderCellProps) {
  const isBulkSelecting = useBulkSelectionStore((state) => state.isBulkSelecting);
  const limit = useSettingsStore((state) => state.limit);

  return (
    <div className="flex flex-wrap items-center gap-1">
      <Badge
        variant={variant}
        render={
          <Link
            to="/dashboard/folders/$id"
            params={{ id: String(folder.id) }}
            search={{ limit }}
            tabIndex={isBulkSelecting ? -1 : 0}
            className={cn(isBulkSelecting && "pointer-events-none opacity-70")}>
            <span className="inline-flex items-center gap-0.75">
              <FolderIcon className="text-primary size-3" />
              <span>{folder.name}</span>
            </span>
          </Link>
        }
      />
    </div>
  );
}
