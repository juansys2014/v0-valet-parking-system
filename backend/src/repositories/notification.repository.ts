import { prisma } from "../db/prisma";

export const notificationRepository = {
  async create(data: {
    ticketId?: string | null;
    ticketCode?: string | null;
    licensePlate?: string | null;
    message: string;
  }) {
    return prisma.notification.create({
      data: {
        ticketId: data.ticketId ?? undefined,
        ticketCode: data.ticketCode ?? undefined,
        licensePlate: data.licensePlate ?? undefined,
        message: data.message,
      },
    });
  },
};
