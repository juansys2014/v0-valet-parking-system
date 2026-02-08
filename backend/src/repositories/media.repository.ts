import { MediaType } from "@prisma/client";
import { prisma } from "../db/prisma";

export const mediaRepository = {
  async createMany(
    ticketId: string,
    items: { type: MediaType; url: string }[]
  ) {
    if (items.length === 0) return { count: 0 };
    return prisma.mediaItem.createMany({
      data: items.map((item) => ({
        ticketId,
        type: item.type,
        url: item.url,
      })),
    });
  },
};
