import { z } from "zod";

const mediaItemSchema = z.object({
  type: z.enum(["photo", "video"]),
  url: z.string(),
});

export const postEntrySchema = z.object({
  ticketCode: z.string().min(1, "ticketCode no puede estar vacío"),
  licensePlate: z.string().min(1, "licensePlate no puede estar vacío"),
  parkingSpot: z.string().optional(),
  attendantName: z.string().optional(),
  notes: z.string().optional(),
  media: z.array(mediaItemSchema).max(10).optional(),
});

export type PostEntryInput = z.infer<typeof postEntrySchema>;
