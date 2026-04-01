import { type Dispatch, type SetStateAction, useState } from "react";

import {
  ArrowDownFromLineIcon,
  ArrowUpFromLineIcon,
  ChevronsUpDownIcon,
  SquareDashedMousePointerIcon,
} from "lucide-react";

import { ALL_BULK_SELECT_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { type BulkAction, useBulkSelection } from "@/providers/bulk-selection";

import SelectGroups from "@/components/blocks/bookmark/select-groups";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BulkActionBarProps {
  isAlertOpen: boolean;
  setIsAlertOpen: Dispatch<SetStateAction<boolean>>;
  handleBulkEdit: () => void;
  handlePostBulkAction: () => void;
}

export default function BulkActionBar({
  isAlertOpen,
  setIsAlertOpen,
  handleBulkEdit,
  handlePostBulkAction,
}: BulkActionBarProps) {
  const [isOnBottom, setIsOnBottom] = useState(true);

  const {
    isBulkSelecting,
    selectedIds,
    bulkAction,
    toggleBulkSelection,
    setCurrentBulkAction,
    stopBulkSelection,
  } = useBulkSelection();

  return (
    <div className="relative">
      <Button
        variant="outline"
        className={cn(
          "cursor-pointer",
          isBulkSelecting &&
            "bg-primary dark:bg-primary text-primary-foreground dark:text-primary-foreground dark:hover:text-foreground hover:text-foreground"
        )}
        onClick={toggleBulkSelection}>
        <SquareDashedMousePointerIcon className="size-4" />
        <span className="hidden sm:inline-block">Bulk edit</span>
      </Button>

      {isBulkSelecting && (
        <div
          className={cn(
            "bg-card ring-foreground/10 grid gap-6 rounded-xl text-sm shadow-2xl ring-1 outline-none",
            "fixed right-4 z-100 w-full max-w-[calc(100%-2rem)] sm:max-w-sm",
            "transition-transform duration-500 ease-in-out",
            isOnBottom ? "top-0 translate-y-[calc(100vh-110%)]" : "top-6 translate-y-0 sm:top-12"
          )}>
          <Collapsible defaultOpen>
            <div className="flex justify-between gap-2 py-4 pr-4 pl-2">
              <div className="flex gap-1">
                <Button
                  variant="secondary"
                  size="icon-sm"
                  className="cursor-pointer"
                  onClick={() => setIsOnBottom((prev) => !prev)}>
                  {isOnBottom ? (
                    <ArrowUpFromLineIcon className="text-muted-foreground" />
                  ) : (
                    <ArrowDownFromLineIcon className="text-muted-foreground" />
                  )}
                </Button>
                <div>
                  <h2 className="flex items-center gap-2 leading-none font-medium">Bulk edit</h2>
                  <p className="text-muted-foreground text-sm">
                    {selectedIds.size > 0 ? (
                      <span>{selectedIds.size} selected</span>
                    ) : (
                      <span>No items selected</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {bulkAction ? (
                  <Badge variant="outline" className="font-normal uppercase">
                    {bulkAction}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground font-normal uppercase">
                    No action
                  </Badge>
                )}
                <CollapsibleTrigger
                  render={
                    <Button
                      disabled={isAlertOpen}
                      variant="secondary"
                      size="icon-sm"
                      className="cursor-pointer">
                      <ChevronsUpDownIcon />
                    </Button>
                  }></CollapsibleTrigger>
              </div>
            </div>
            <CollapsibleContent>
              <div className="px-4 pb-4">
                <Select
                  items={ALL_BULK_SELECT_OPTIONS}
                  value={bulkAction}
                  onValueChange={(value) => setCurrentBulkAction(value as BulkAction)}>
                  <SelectTrigger className="w-full cursor-pointer">
                    <SelectValue
                      placeholder="Select Action"
                      className={cn(bulkAction === "delete" && "text-destructive")}
                    />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false} align="end" sideOffset={6}>
                    <SelectGroups />
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col-reverse gap-2 px-4 py-3 sm:flex-row sm:justify-end">
                <Button
                  disabled={isAlertOpen}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={stopBulkSelection}>
                  Cancel
                </Button>

                <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                  <AlertDialogTrigger
                    render={
                      <Button
                        className="cursor-pointer"
                        disabled={selectedIds.size === 0 || !bulkAction || isAlertOpen}>
                        Continue
                      </Button>
                    }></AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        <span>This action cannot be undone. This will permanently </span>
                        <span>{bulkAction === "delete" ? "delete" : "modify"}</span>
                        <span> the selected bookmarks.</span>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        className="cursor-pointer"
                        onClick={() => {
                          handleBulkEdit();
                          handlePostBulkAction();
                        }}>
                        Execute
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </div>
  );
}
