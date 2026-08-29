import { useGlobalModal } from "@/context/global-modal";

import { CreateTagForm } from "@/components/forms/create-tag-form";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function GlobalModal() {
  const { activeGlobalDialog, closeGlobalDialog } = useGlobalModal();
  return (
    <>
      {activeGlobalDialog === "tag-form" && (
        <Dialog open onOpenChange={closeGlobalDialog}>
          <DialogContent className="flex flex-col">
            <CreateTagForm />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
