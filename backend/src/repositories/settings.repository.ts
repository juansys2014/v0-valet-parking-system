import { prisma } from "../db/prisma";

const SETTINGS_ID = "default";

export const settingsRepository = {
  async get() {
    const row = await prisma.appSettings.findUnique({
      where: { id: SETTINGS_ID },
    });
    return row ?? null;
  },

  async update(data: {
    companyName?: string;
    logo?: string | null;
    showLicensePlate?: boolean;
    showParkingSpot?: boolean;
    showAttendantName?: boolean;
    showMedia?: boolean;
    showNotes?: boolean;
  }) {
    return prisma.appSettings.upsert({
      where: { id: SETTINGS_ID },
      create: {
        id: SETTINGS_ID,
        companyName: data.companyName ?? "Valet Parking",
        logo: data.logo ?? undefined,
        showLicensePlate: data.showLicensePlate ?? true,
        showParkingSpot: data.showParkingSpot ?? true,
        showAttendantName: data.showAttendantName ?? true,
        showMedia: data.showMedia ?? true,
        showNotes: data.showNotes ?? true,
      },
      update: {
        ...(data.companyName !== undefined && { companyName: data.companyName }),
        ...(data.logo !== undefined && { logo: data.logo }),
        ...(data.showLicensePlate !== undefined && { showLicensePlate: data.showLicensePlate }),
        ...(data.showParkingSpot !== undefined && { showParkingSpot: data.showParkingSpot }),
        ...(data.showAttendantName !== undefined && { showAttendantName: data.showAttendantName }),
        ...(data.showMedia !== undefined && { showMedia: data.showMedia }),
        ...(data.showNotes !== undefined && { showNotes: data.showNotes }),
      },
    });
  },
};
