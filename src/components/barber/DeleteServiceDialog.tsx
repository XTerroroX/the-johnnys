
import { Button } from "@/components/ui/button";

interface DeleteServiceDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteServiceDialog({
  open,
  onClose,
  onConfirm,
}: DeleteServiceDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg space-y-4 max-w-sm w-full">
        <h4 className="text-lg font-semibold mb-4">Delete Service</h4>
        <p>Are you sure you want to delete this service?</p>
        <div className="flex justify-end gap-4 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
