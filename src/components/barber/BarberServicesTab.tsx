
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { useBarberServices } from '@/hooks/useBarberServices';
import { useCreateBarberService } from '@/hooks/useCreateBarberService';
import { useUpdateBarberService } from '@/hooks/useUpdateBarberService';
import { useDeleteBarberService } from '@/hooks/useDeleteBarberService';

export default function BarberServicesTab({ barberId }: { barberId: string }) {
  const [editService, setEditService] = useState<any | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [deleteServiceId, setDeleteServiceId] = useState<number | null>(null);

  const { data: services = [], isLoading } = useBarberServices(barberId);
  const createService = useCreateBarberService(barberId);
  const updateService = useUpdateBarberService(barberId);
  const deleteService = useDeleteBarberService(barberId);

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.currentTarget));
    if (String(form.name).length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    if (Number(form.price) < 0) {
      toast.error("Price must be at least 0");
      return;
    }
    if (Number(form.duration) < 5) {
      toast.error("Duration must be at least 5 minutes");
      return;
    }
    if (editService) {
      updateService.mutate({ ...editService, ...form }, {
        onSuccess: () => {
          toast.success("Service updated");
          setShowDialog(false);
          setEditService(null);
        },
        onError: (error: any) => {
          toast.error(error.message);
        }
      });
    } else {
      createService.mutate(form, {
        onSuccess: () => {
          toast.success("Service created");
          setShowDialog(false);
        },
        onError: (error: any) => {
          toast.error(error.message);
        }
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">My Services</h1>
        <Button onClick={() => { setEditService(null); setShowDialog(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Service
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>My Barber Services</CardTitle>
          <CardDescription>Manage the services you offer to clients.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-4 w-4 animate-spin rounded-full bg-primary" />
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No services found. Add your first service to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Duration (min)</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service: any) => (
                    <TableRow key={service.id}>
                      <TableCell>{service.name}</TableCell>
                      <TableCell>{service.description}</TableCell>
                      <TableCell>${Number(service.price).toFixed(2)}</TableCell>
                      <TableCell>{service.duration}</TableCell>
                      <TableCell>
                        {service.active ? (
                          <span className="text-green-600 font-semibold">Yes</span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="z-50 bg-white">
                            <DropdownMenuItem onClick={() => { setEditService(service); setShowDialog(true); }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => setDeleteServiceId(service.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form
            onSubmit={handleSave}
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
              <Button
                type="button"
                variant="outline"
                onClick={() => { setShowDialog(false); setEditService(null); }}>
                Cancel
              </Button>
              <Button type="submit" disabled={createService.isPending || updateService.isPending}>
                {editService ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteServiceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg space-y-4 max-w-sm w-full">
            <h4 className="text-lg font-semibold mb-4">Delete Service</h4>
            <p>Are you sure you want to delete this service?</p>
            <div className="flex justify-end gap-4 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteServiceId(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  deleteService.mutate(deleteServiceId!, {
                    onSuccess: () => {
                      toast.success('Service deleted');
                      setDeleteServiceId(null);
                    },
                    onError: (error: any) => {
                      toast.error(error.message);
                    }
                  });
                }}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
