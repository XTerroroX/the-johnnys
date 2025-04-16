import React, { useState } from 'react';
import { useServices } from '@/hooks/useServices';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, Edit, Trash } from 'lucide-react';
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
import { ServiceFormDialog } from './ServiceFormDialog';
import { DeleteServiceDialog } from './DeleteServiceDialog';
import { Service } from '@/types/service';

interface ServicesTabProps {
  onAddNewService: () => void;
  onEditService: (service: Service) => void;
  selectedService: Service | null;
  isServiceDialogOpen: boolean;
  setIsServiceDialogOpen: (open: boolean) => void;
  isDeleteServiceDialogOpen: boolean;
  setIsDeleteServiceDialogOpen: (open: boolean) => void;
  serviceForm: any;
  deleteServiceMutation: any;
}

export function ServicesTab({
  onAddNewService,
  onEditService,
  selectedService,
  isServiceDialogOpen,
  setIsServiceDialogOpen,
  isDeleteServiceDialogOpen,
  setIsDeleteServiceDialogOpen,
  serviceForm,
  deleteServiceMutation,
}: ServicesTabProps) {
  const { data: services = [], isLoading: isLoadingServices } = useServices();
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Services Management</h1>
        <Button onClick={onAddNewService}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Service
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Services</CardTitle>
          <CardDescription>Manage barbershop services, pricing, and availability.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingServices ? (
            <div className="flex justify-center py-8">
              <div className="flex items-center justify-center space-x-2">
                <div className="h-4 w-4 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]"></div>
                <div className="h-4 w-4 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]"></div>
                <div className="h-4 w-4 animate-bounce rounded-full bg-primary"></div>
              </div>
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
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell>{service.description}</TableCell>
                      <TableCell>${service.price.toFixed(2)}</TableCell>
                      <TableCell>{service.duration} min</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${service.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {service.active ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="touch-manipulation focus:ring-2 focus:ring-offset-2 focus:ring-primary active:scale-95 transition-transform"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent 
                            align="end"
                            side="left"
                            className="w-[200px] z-[9999] bg-white dark:bg-slate-950 border border-slate-200 shadow-lg"
                          >
                            <DropdownMenuItem 
                              className="cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800"
                              onClick={() => onEditService(service)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800"
                              onClick={() => {
                                setServiceToDelete(service);
                                setIsDeleteServiceDialogOpen(true);
                              }}
                            >
                              <Trash className="mr-2 h-4 w-4" />
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

      <ServiceFormDialog
        isOpen={isServiceDialogOpen}
        onClose={() => setIsServiceDialogOpen(false)}
        service={selectedService}
        form={serviceForm}
      />

      <DeleteServiceDialog
        isOpen={isDeleteServiceDialogOpen}
        onClose={() => setIsDeleteServiceDialogOpen(false)}
        onDelete={() => {
          if (serviceToDelete) {
            deleteServiceMutation.mutate(serviceToDelete.id);
          }
        }}
      />
    </div>
  );
}
