import { prisma } from "../db/prisma";

const SETTINGS_ID = "default";

export const settingsRepository = {
  async get() {
    const row = await prisma.appSettings.findUnique({
      where: { id: SETTINGS_ID },
    });
    return row ?? null;
  },

  async update(data: { companyName?: string; logo?: string | null }) {
    return prisma.appSettings.upsert({
      where: { id: SETTINGS_ID },
      create: {
        id: SETTINGS_ID,
        companyName: data.companyName ?? "Valet Parking",
        logo: data.logo ?? undefined,
      },
      update: {
        ...(data.companyName !== undefined && { companyName: data.companyName }),
        ...(data.logo !== undefined && { logo: data.logo }),
      },
    });
  },
};
