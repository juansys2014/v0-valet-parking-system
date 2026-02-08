import { ticketRepository } from "../repositories/ticket.repository";
import { mediaRepository } from "../repositories/media.repository";
import type { PostEntryInput } from "../validators/entry";
import type { MediaType } from "@prisma/client";

function toUpper(s: string | undefined | null): string | null {
  if (s == null || s === "") return null;
  return s.toUpperCase().trim() || null;
}

export async function createEntry(input: PostEntryInput) {
  const licensePlate = toUpper(input.licensePlate) ?? input.licensePlate;
  const parkingSpot = toUpper(input.parkingSpot) ?? null;
  const ticketCode = input.ticketCode.trim() || null;

  const duplicate = await ticketRepository.findActiveDuplicate(
    ticketCode ?? ""
  );
  if (duplicate) {
    return { ok: true as const, duplicate: true as const, ticket: duplicate };
  }

  const ticket = await ticketRepository.create({
    ticketCode: ticketCode || null,
    licensePlate,
    parkingSpot,
    notes: input.notes?.trim() || null,
    checkinAttendantName: input.attendantName?.trim() || null,
    status: "parked",
    wasRegistered: true,
  });

  const media = input.media?.slice(0, 10) ?? [];
  if (media.length > 0) {
    await mediaRepository.createMany(
      ticket.id,
      media.map((m) => ({ type: m.type as MediaType, url: m.url }))
    );
  }

  const withMedia = await ticketRepository.findById(ticket.id);
  return { ok: true as const, duplicate: false as const, ticket: withMedia! };
}
