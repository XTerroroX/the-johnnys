
import { z } from "zod";

export const ServiceFormSchema = z.object({
  name: z.string().min(2, { message: "Service name must be at least 2 characters." }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { message: "Price must be a positive number." }),
  duration: z.coerce.number().min(5, { message: "Duration must be at least 5 minutes." }),
  active: z.boolean().default(true),
});

export const BarberFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  specialty: z.string().optional(),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export const BarberEditFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  specialty: z.string().optional(),
});
