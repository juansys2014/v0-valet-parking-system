import { ticketRepository } from "../repositories/ticket.repository";
import type { PostReadyInput } from "../validators/tickets";
import type { PostDeliveredInput } from "../validators/tickets";

export async function markReady(
  ticketId: string,
  input: PostReadyInput
) {
  const ticket = await ticketRepository.findById(ticketId);
  if (!ticket) {
    return { ok: false as const, error: "Ticket no encontrado" };
  }

  const readyTime = new Date();
  const name = input.attendantName?.trim() ?? null;
  await ticketRepository.updateToReady(ticket.id, readyTime, name);
  const updated = await ticketRepository.findById(ticket.id);
  return { ok: true as const, ticket: updated! };
}

export async function markDelivered(
  ticketId: string,
  input: PostDeliveredInput
) {
  const ticket = await ticketRepository.findById(ticketId);
  if (!ticket) {
    return { ok: false as const, error: "Ticket no encontrado" };
  }

  const now = new Date();
  const name = input.attendantName?.trim() ?? null;
  await ticketRepository.updateToDelivered(ticket.id, now, now, name);
  const updated = await ticketRepository.findById(ticket.id);
  return { ok: true as const, ticket: updated! };
}
