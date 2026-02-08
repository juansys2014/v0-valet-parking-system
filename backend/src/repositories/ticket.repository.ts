import { Prisma, TicketStatus } from "@prisma/client";
import { prisma } from "../db/prisma";

export const ticketRepository = {
  async create(data: {
    ticketCode: string | null;
    licensePlate: string;
    parkingSpot: string | null;
    notes: string | null;
    checkinAttendantName: string | null;
    status?: TicketStatus;
    wasRegistered?: boolean;
    requestedTime?: Date | null;
  }) {
    return prisma.ticket.create({
      data: {
        ticketCode: data.ticketCode,
        licensePlate: data.licensePlate,
        parkingSpot: data.parkingSpot,
        notes: data.notes,
        checkinAttendantName: data.checkinAttendantName,
        status: data.status ?? "parked",
        wasRegistered: data.wasRegistered ?? true,
        requestedTime: data.requestedTime ?? undefined,
      },
    });
  },

  async findActiveDuplicate(ticketCode: string) {
    return prisma.ticket.findFirst({
      where: {
        ticketCode,
        status: { not: "delivered" },
      },
    });
  },

  async findManyActive(search?: string) {
    const where: Prisma.TicketWhereInput = { status: "parked" };
    if (search?.trim()) {
      const term = search.trim();
      where.OR = [
        { ticketCode: { contains: term } },
        { licensePlate: { contains: term } },
      ];
    }
    return prisma.ticket.findMany({
      where,
      orderBy: { checkinTime: "desc" },
      include: { mediaItems: true },
    });
  },

  async findManyDelivered(search?: string) {
    const where: Prisma.TicketWhereInput = { status: "delivered" };
    if (search?.trim()) {
      const term = search.trim();
      where.OR = [
        { ticketCode: { contains: term } },
        { licensePlate: { contains: term } },
      ];
    }
    return prisma.ticket.findMany({
      where,
      orderBy: { deliveredTime: "desc" },
      include: { mediaItems: true },
    });
  },

  async findById(id: string) {
    return prisma.ticket.findUnique({
      where: { id },
      include: { mediaItems: true },
    });
  },

  async updateToRequested(id: string, requestedTime: Date) {
    return prisma.ticket.update({
      where: { id },
      data: { status: "requested", requestedTime },
    });
  },

  async updateToReady(
    id: string,
    readyTime: Date,
    deliveryAttendantName: string | null
  ) {
    return prisma.ticket.update({
      where: { id },
      data: {
        status: "ready",
        readyTime,
        deliveryAttendantName,
      },
    });
  },

  async updateToDelivered(
    id: string,
    deliveredTime: Date,
    checkoutTime: Date,
    deliveryAttendantName: string | null
  ) {
    return prisma.ticket.update({
      where: { id },
      data: {
        status: "delivered",
        deliveredTime,
        checkoutTime,
        deliveryAttendantName,
      },
    });
  },

  async findRequestedAndReady() {
    const [requested, ready] = await Promise.all([
      prisma.ticket.findMany({
        where: { status: "requested" },
        orderBy: { requestedTime: "desc" },
        include: { mediaItems: true },
      }),
      prisma.ticket.findMany({
        where: { status: "ready" },
        orderBy: { requestedTime: "desc" },
        include: { mediaItems: true },
      }),
    ]);
    return { requested, ready };
  },
};
