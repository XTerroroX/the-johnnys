import React from 'react';
import AdminStats from '../AdminStats';
import { ServicesTab } from './ServicesTab';
import { BarbersTab } from './BarbersTab';
import { BookingsTab } from './BookingsTab';
import ProfileSettings from '../ProfileSettings';
import { Service } from '@/types/service';
import { Barber } from '@/types/barber';
import { useForm } from "react-hook-form";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { ServiceFormSchema, BarberFormSchema, BarberEditFormSchema } from '@/types/schemas';
import {
  DeleteServiceMutation,
  DeleteBarberMutation,
  UpdateBookingStatusMutation
} from '@/types/mutations';

interface MainContentProps {
  activeTab: string;
  userId: string;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  dateFilter: string;
  setDateFilter: React.Dispatch<React.SetStateAction<string>>;
  barberFilter: string;
  setBarberFilter: React.Dispatch<React.SetStateAction<string>>;
  serviceFilter: string;
  setServiceFilter: React.Dispatch<React.SetStateAction<string>>;
  selectedService: Service | null;
  setSelectedService: React.Dispatch<React.SetStateAction<Service | null>>;
  selectedBarber: Barber | null;
  setSelectedBarber: React.Dispatch<React.SetStateAction<Barber | null>>;
  isServiceDialogOpen: boolean;
  setIsServiceDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isBarberDialogOpen: boolean;
  setIsBarberDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDeleteServiceDialogOpen: boolean;
  setIsDeleteServiceDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDeleteBarberDialogOpen: boolean;
  setIsDeleteBarberDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  serviceForm: UseFormReturn<z.infer<typeof ServiceFormSchema>>;
  barberForm: UseFormReturn<z.infer<typeof BarberFormSchema>>;
  barberEditForm: UseFormReturn<z.infer<typeof BarberEditFormSchema>>;
  deleteServiceMutation: DeleteServiceMutation;
  deleteBarberMutation: DeleteBarberMutation;
  updateBookingStatusMutation: UpdateBookingStatusMutation;
  onAddNewService: () => void;
  onEditService: (service: Service) => void;
  onAddNewBarber: () => void;
  onEditBarber: (barber: Barber) => void;
}

export function MainContent({ 
  activeTab,
  userId,
  searchQuery,
  setSearchQuery,
  dateFilter,
  setDateFilter,
  barberFilter,
  setBarberFilter,
  serviceFilter,
  setServiceFilter,
  selectedService,
  setSelectedService,
  selectedBarber,
  setSelectedBarber,
  isServiceDialogOpen,
  setIsServiceDialogOpen,
  isBarberDialogOpen,
  setIsBarberDialogOpen,
  isDeleteServiceDialogOpen,
  setIsDeleteServiceDialogOpen,
  isDeleteBarberDialogOpen,
  setIsDeleteBarberDialogOpen,
  serviceForm,
  barberForm,
  barberEditForm,
  deleteServiceMutation,
  deleteBarberMutation,
  updateBookingStatusMutation,
  onAddNewService,
  onEditService,
  onAddNewBarber,
  onEditBarber
}: MainContentProps) {
  return (
    <main className="flex-1 md:ml-64 p-4 md:p-8 pt-[calc(var(--navbar-height)+1rem)]">
      {activeTab === "dashboard" && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <AdminStats />
        </div>
      )}

      {activeTab === "services" && (
        <ServicesTab
          onAddNewService={onAddNewService}
          onEditService={onEditService}
          selectedService={selectedService}
          isServiceDialogOpen={isServiceDialogOpen}
          setIsServiceDialogOpen={setIsServiceDialogOpen}
          isDeleteServiceDialogOpen={isDeleteServiceDialogOpen}
          setIsDeleteServiceDialogOpen={setIsDeleteServiceDialogOpen}
          serviceForm={serviceForm}
          deleteServiceMutation={deleteServiceMutation}
        />
      )}

      {activeTab === "barbers" && (
        <BarbersTab
          onAddNewBarber={onAddNewBarber}
          onEditBarber={onEditBarber}
          selectedBarber={selectedBarber}
          isBarberDialogOpen={isBarberDialogOpen}
          setIsBarberDialogOpen={setIsBarberDialogOpen}
          isDeleteBarberDialogOpen={isDeleteBarberDialogOpen}
          setIsDeleteBarberDialogOpen={setIsDeleteBarberDialogOpen}
          barberForm={barberForm}
          barberEditForm={barberEditForm}
          deleteBarberMutation={deleteBarberMutation}
        />
      )}

      {activeTab === "bookings" && (
        <BookingsTab
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          barberFilter={barberFilter}
          setBarberFilter={setBarberFilter}
          serviceFilter={serviceFilter}
          setServiceFilter={setServiceFilter}
          updateBookingStatusMutation={updateBookingStatusMutation}
        />
      )}

      {activeTab === "profile" && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold">My Profile</h1>
          </div>
          {userId && <ProfileSettings userId={userId} userRole="superadmin" />}
        </div>
      )}
    </main>
  );
}
