import { ticketRepository } from "../repositories/ticket.repository";

export async function getAlerts() {
  const { requested, ready } = await ticketRepository.findRequestedAndReady();
  return { requested, ready };
}
