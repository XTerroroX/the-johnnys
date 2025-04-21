
import { Button } from "@/components/ui/button";

interface ServiceDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  editService: any | null;
}

export default function ServiceDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  editService,
}: ServiceDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40">
      <form
        onSubmit={onSubmit}
        className="bg-white dark:bg-slate-900 p-6 rounded-lg space-y-4 max-w-sm w-full"
      >
        <h4 className="text-lg font-semibold mb-2">{editService ? 'Edit Service' : 'Add Service'}</h4>
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input
            name="name"
            defaultValue={editService?.name || ''}
            required
            minLength={2}
            className="border px-3 py-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            name="description"
            defaultValue={editService?.description || ''}
            className="border px-3 py-2 rounded w-full"
          />
        </div>
        <div className="flex gap-2">
          <div className="w-1/2">
            <label className="block mb-1 font-medium">Price ($)</label>
            <input
              name="price"
              type="number"
              min={0}
              step={0.01}
              defaultValue={editService?.price ?? ''}
              required
              className="border px-3 py-2 rounded w-full"
            />
          </div>
          <div className="w-1/2">
            <label className="block mb-1 font-medium">Duration (min)</label>
            <input
              name="duration"
              type="number"
              min={5}
              defaultValue={editService?.duration ?? 30}
              required
              className="border px-3 py-2 rounded w-full"
            />
          </div>
        </div>
        <div>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="active"
              defaultChecked={editService ? editService.active : true}
              className="accent-primary"
            /> Active
          </label>
        </div>
        <div className="flex justify-end gap-4 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {editService ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </div>
  );
}
