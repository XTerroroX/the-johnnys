
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useBarberServices } from "@/hooks/useBarberServices";
import { useCreateBarberService } from "@/hooks/useCreateBarberService";
import { useUpdateBarberService } from "@/hooks/useUpdateBarberService";
import { useDeleteBarberService } from "@/hooks/useDeleteBarberService";
import ServiceTable from "./ServiceTable";
import ServiceDialog from "./ServiceDialog";
import DeleteServiceDialog from "./DeleteServiceDialog";

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
      updateService.mutate(
        { ...editService, ...form },
        {
          onSuccess: () => {
            toast.success("Service updated");
            setShowDialog(false);
            setEditService(null);
          },
          onError: (error: any) => {
            toast.error(error.message);
          },
        }
      );
    } else {
      createService.mutate(form, {
        onSuccess: () => {
          toast.success("Service created");
          setShowDialog(false);
        },
        onError: (error: any) => {
          toast.error(error.message);
        },
      });
    }
  };

  const AddServiceButton = (
    <Button
      onClick={() => {
        setEditService(null);
        setShowDialog(true);
      }}
      className="flex items-center gap-2 md:static md:ml-auto
        fixed z-[100] bottom-4 right-4 md:relative md:bottom-auto md:right-auto
        shadow-lg md:shadow-none rounded-full md:rounded
        bg-primary md:bg-primary
        text-white
        md:px-4 md:py-2 px-5 py-4
        transition-all"
      size="lg"
      aria-label="Add Service"
    >
      <Plus className="mr-2 h-5 w-5" />
      <span className="hidden md:inline">Add New Service</span>
    </Button>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
        <h1 className="text-2xl font-bold">My Services</h1>
        <div className="hidden md:block">{AddServiceButton}</div>
      </div>
      <div className="block md:hidden">{AddServiceButton}</div>
      <ServiceTable
        services={services}
        isLoading={isLoading}
        onEdit={service => {
          setEditService(service);
          setShowDialog(true);
        }}
        onDelete={serviceId => setDeleteServiceId(serviceId)}
      />
      <ServiceDialog
        open={showDialog}
        onClose={() => {
          setShowDialog(false);
          setEditService(null);
        }}
        onSubmit={handleSave}
        isSubmitting={createService.isPending || updateService.isPending}
        editService={editService}
      />
      <DeleteServiceDialog
        open={!!deleteServiceId}
        onClose={() => setDeleteServiceId(null)}
        onConfirm={() => {
          if (!deleteServiceId) return;
          deleteService.mutate(deleteServiceId, {
            onSuccess: () => {
              toast.success("Service deleted");
              setDeleteServiceId(null);
            },
            onError: (error: any) => {
              toast.error(error.message);
            },
          });
        }}
      />
    </div>
  );
}
