import { z } from "zod";

export const postCheckoutRequestSchema = z.object({
  ticketId: z.string().uuid(),
});

export const postQuickExitSchema = z.object({
  ticketCode: z.string().min(1, "ticketCode no puede estar vacío"),
  licensePlate: z.string().optional(),
});

export type PostCheckoutRequestInput = z.infer<typeof postCheckoutRequestSchema>;
export type PostQuickExitInput = z.infer<typeof postQuickExitSchema>;
