
import { UseMutationResult } from "@tanstack/react-query";
import { z } from "zod";
import { ServiceFormSchema, BarberFormSchema, BarberEditFormSchema } from "./schemas";
import { Service } from "./service";
import { Barber } from "./barber";

export type DeleteServiceMutation = UseMutationResult<
  void,
  Error,
  number,
  unknown
>;

export type DeleteBarberMutation = UseMutationResult<
  void,
  Error,
  string,
  unknown
>;

export type UpdateBookingStatusMutation = UseMutationResult<
  any,
  Error,
  { id: number; status: 'confirmed' | 'completed' | 'cancelled' },
  unknown
>;

export type CreateServiceMutation = UseMutationResult<
  Service,
  Error,
  z.infer<typeof ServiceFormSchema>,
  unknown
>;

export type UpdateServiceMutation = UseMutationResult<
  Service,
  Error,
  Service,
  unknown
>;

export type CreateBarberMutation = UseMutationResult<
  any,
  Error,
  z.infer<typeof BarberFormSchema>,
  unknown
>;

export type UpdateBarberMutation = UseMutationResult<
  any,
  Error,
  Partial<Barber>,
  unknown
>;
