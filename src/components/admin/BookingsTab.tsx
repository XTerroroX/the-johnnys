
import React from 'react';
import { useBookings } from '@/hooks/useBookings';
import { useServices } from '@/hooks/useServices';
import { useBarbers } from '@/hooks/useBarbers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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

interface BookingsTabProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  dateFilter: string;
  setDateFilter: (date: string) => void;
  barberFilter: string;
  setBarberFilter: (barberId: string) => void;
  serviceFilter: string;
  setServiceFilter: (serviceId: string) => void;
  updateBookingStatusMutation: any;
}

export function BookingsTab({
  searchQuery,
  setSearchQuery,
  dateFilter,
  setDateFilter,
  barberFilter,
  setBarberFilter,
  serviceFilter,
  setServiceFilter,
  updateBookingStatusMutation,
}: BookingsTabProps) {
  const { data: bookings = [], isLoading: isLoadingBookings } = useBookings();
  const { data: services = [] } = useServices();
  const { data: barbers = [] } = useBarbers();

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (booking.service?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (booking.barber?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDate = !dateFilter || booking.date === dateFilter;
    const matchesBarber = !barberFilter || booking.barber_id === barberFilter;
    const matchesService = !serviceFilter || booking.service_id === parseInt(serviceFilter);
    
    return matchesSearch && matchesDate && matchesBarber && matchesService;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Bookings Management</h1>
        <div className="flex gap-2">
          <Input
            type="search"
            placeholder="Search bookings..."
            className="max-w-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>Manage customer bookings and appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div>
              <label htmlFor="dateFilter" className="block text-sm font-medium mb-1">Date</label>
              <Input
                id="dateFilter"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full sm:w-auto"
              />
            </div>
            <div>
              <label htmlFor="barberFilter" className="block text-sm font-medium mb-1">Barber</label>
              <select
                id="barberFilter"
                value={barberFilter}
                onChange={(e) => setBarberFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Barbers</option>
                {barbers.map(barber => (
                  <option key={barber.id} value={barber.id}>{barber.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="serviceFilter" className="block text-sm font-medium mb-1">Service</label>
              <select
                id="serviceFilter"
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Services</option>
                {services.map(service => (
                  <option key={service.id} value={service.id.toString()}>{service.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          {isLoadingBookings ? (
            <div className="flex justify-center py-8">
              <div className="flex items-center justify-center space-x-2">
                <div className="h-4 w-4 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]"></div>
                <div className="h-4 w-4 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]"></div>
                <div className="h-4 w-4 animate-bounce rounded-full bg-primary"></div>
              </div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No bookings found with the current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Barber</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.date}</TableCell>
                      <TableCell>{booking.start_time} - {booking.end_time}</TableCell>
                      <TableCell>
                        <div>{booking.customer_name}</div>
                        <div className="text-xs text-muted-foreground">{booking.customer_email}</div>
                      </TableCell>
                      <TableCell>{booking.service?.name || 'Unknown Service'}</TableCell>
                      <TableCell>{booking.barber?.name || 'Unknown Barber'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 
                          booking.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
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
                            className="w-[200px] z-[100] bg-white dark:bg-slate-950 border border-slate-200 shadow-lg"
                          >
                            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                            <DropdownMenuItem
                              className="cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800"
                              onClick={() => updateBookingStatusMutation.mutate({ id: booking.id, status: 'confirmed' })}
                            >
                              Mark as Confirmed
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800"
                              onClick={() => updateBookingStatusMutation.mutate({ id: booking.id, status: 'completed' })}
                            >
                              Mark as Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800"
                              onClick={() => updateBookingStatusMutation.mutate({ id: booking.id, status: 'cancelled' })}
                            >
                              Mark as Cancelled
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
    </div>
  );
}
