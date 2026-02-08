import { z } from "zod";

export const postReadySchema = z.object({
  attendantName: z.string().optional(),
});

export const postDeliveredSchema = z.object({
  attendantName: z.string().optional(),
});

export type PostReadyInput = z.infer<typeof postReadySchema>;
export type PostDeliveredInput = z.infer<typeof postDeliveredSchema>;
