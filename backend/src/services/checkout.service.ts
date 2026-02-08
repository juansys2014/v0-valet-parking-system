import { ticketRepository } from "../repositories/ticket.repository";
import { notificationRepository } from "../repositories/notification.repository";
import type { PostCheckoutRequestInput } from "../validators/checkout";
import type { PostQuickExitInput } from "../validators/checkout";

export async function requestCheckout(input: PostCheckoutRequestInput) {
  const ticket = await ticketRepository.findById(input.ticketId);
  if (!ticket) {
    return { ok: false as const, error: "Ticket no encontrado" };
  }

  const requestedTime = new Date();
  await ticketRepository.updateToRequested(ticket.id, requestedTime);
  await notificationRepository.create({
    ticketId: ticket.id,
    ticketCode: ticket.ticketCode ?? undefined,
    licensePlate: ticket.licensePlate,
    message: "Vehículo solicitado para entrega.",
  });

  const updated = await ticketRepository.findById(ticket.id);
  return { ok: true as const, ticket: updated! };
}

export async function quickExit(input: PostQuickExitInput) {
  const licensePlate = (input.licensePlate?.toUpperCase().trim() || "-").toUpperCase();
  const ticketCode = input.ticketCode.trim();
  const now = new Date();

  const ticket = await ticketRepository.create({
    ticketCode,
    licensePlate,
    parkingSpot: null,
    notes: null,
    checkinAttendantName: null,
    status: "requested",
    wasRegistered: false,
    requestedTime: now,
  });

  await notificationRepository.create({
    ticketId: ticket.id,
    ticketCode,
    licensePlate,
    message: "Salida rápida solicitada.",
  });

  return { ok: true as const, ticket };
}
