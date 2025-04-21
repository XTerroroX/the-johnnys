
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ServiceTableProps {
  services: any[];
  isLoading: boolean;
  onEdit: (service: any) => void;
  onDelete: (serviceId: number) => void;
}

export default function ServiceTable({
  services,
  isLoading,
  onEdit,
  onDelete,
}: ServiceTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-4 w-4 animate-spin rounded-full bg-primary" />
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No services found. Add your first service to get started.
        </p>
      </div>
    );
  }

  return (
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="dropdown-menu-trigger touch-manipulation z-[100]"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="z-[9999] bg-white dark:bg-slate-950 border border-slate-200 shadow-lg">
                    <DropdownMenuItem onClick={() => onEdit(service)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => onDelete(service.id)}>
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
  );
}
