
import React, { useState } from 'react';
import { useBarbers } from '@/hooks/useBarbers';
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
import { BarberFormDialog } from './BarberFormDialog';
import { DeleteBarberDialog } from './DeleteBarberDialog';
import { Barber } from '@/types/barber';

interface BarbersTabProps {
  onAddNewBarber: () => void;
  onEditBarber: (barber: Barber) => void;
  selectedBarber: Barber | null;
  isBarberDialogOpen: boolean;
  setIsBarberDialogOpen: (open: boolean) => void;
  isDeleteBarberDialogOpen: boolean;
  setIsDeleteBarberDialogOpen: (open: boolean) => void;
  barberForm: any;
  barberEditForm: any;
  deleteBarberMutation: any;
}

export function BarbersTab({
  onAddNewBarber,
  onEditBarber,
  selectedBarber,
  isBarberDialogOpen,
  setIsBarberDialogOpen,
  isDeleteBarberDialogOpen,
  setIsDeleteBarberDialogOpen,
  barberForm,
  barberEditForm,
  deleteBarberMutation,
}: BarbersTabProps) {
  const { data: barbers = [], isLoading: isLoadingBarbers, error: barbersError } = useBarbers();
  const [barberToDelete, setBarberToDelete] = useState<Barber | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Barbers Management</h1>
        <Button onClick={onAddNewBarber}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Barber
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Barbers</CardTitle>
          <CardDescription>Manage barber accounts and their information.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingBarbers ? (
            <div className="flex justify-center py-8">
              <div className="flex items-center justify-center space-x-2">
                <div className="h-4 w-4 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]"></div>
                <div className="h-4 w-4 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]"></div>
                <div className="h-4 w-4 animate-bounce rounded-full bg-primary"></div>
              </div>
            </div>
          ) : barbersError ? (
            <div className="text-center py-8">
              <p className="text-red-500">Error loading barbers: {(barbersError as Error).message}</p>
            </div>
          ) : barbers && barbers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {barbers.map((barber) => (
                    <TableRow key={barber.id}>
                      <TableCell className="font-medium">{barber.name}</TableCell>
                      <TableCell>{barber.email}</TableCell>
                      <TableCell>{barber.specialty || '-'}</TableCell>
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
                            className="w-[200px] z-[9999] bg-white dark:bg-slate-950 border border-slate-200"
                          >
                            <DropdownMenuItem 
                              className="cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800"
                              onClick={() => onEditBarber(barber)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800"
                              onClick={() => {
                                setBarberToDelete(barber);
                                setIsDeleteBarberDialogOpen(true);
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
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No barbers found. Add your first barber to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <BarberFormDialog
        isOpen={isBarberDialogOpen}
        onClose={() => setIsBarberDialogOpen(false)}
        barber={selectedBarber}
        form={selectedBarber ? barberEditForm : barberForm}
        isEdit={!!selectedBarber}
      />

      <DeleteBarberDialog
        isOpen={isDeleteBarberDialogOpen}
        onClose={() => setIsDeleteBarberDialogOpen(false)}
        onDelete={() => {
          if (barberToDelete) {
            deleteBarberMutation.mutate(barberToDelete.id);
          }
        }}
      />
    </div>
  );
}
