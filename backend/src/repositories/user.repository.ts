import { prisma } from "../db/prisma";

export const userRepository = {
  async findById(id: string) {
    return prisma.appUser.findUnique({
      where: { id },
    });
  },

  async findByName(name: string) {
    const trimmed = name.trim();
    return prisma.appUser.findFirst({
      where: { name: trimmed },
    });
  },

  async findByToken(accessToken: string) {
    if (!accessToken.trim()) return null;
    return prisma.appUser.findFirst({
      where: { accessToken },
    });
  },

  async list() {
    return prisma.appUser.findMany({
      orderBy: { createdAt: "asc" },
    });
  },

  async create(data: {
    name: string;
    passwordHash: string;
    isAdmin: boolean;
    showCheckin: boolean;
    showCheckout: boolean;
    showVehicles: boolean;
    showAlerts: boolean;
    showHistory: boolean;
    accessToken?: string | null;
  }) {
    return prisma.appUser.create({
      data: {
        name: data.name.trim(),
        passwordHash: data.passwordHash,
        isAdmin: data.isAdmin,
        showCheckin: data.showCheckin,
        showCheckout: data.showCheckout,
        showVehicles: data.showVehicles,
        showAlerts: data.showAlerts,
        showHistory: data.showHistory,
        accessToken: data.accessToken ?? null,
      },
    });
  },

  async update(
    id: string,
    data: {
      name?: string;
      passwordHash?: string;
      isAdmin?: boolean;
      showCheckin?: boolean;
      showCheckout?: boolean;
      showVehicles?: boolean;
      showAlerts?: boolean;
      showHistory?: boolean;
      accessToken?: string | null;
    }
  ) {
    const updateData: {
      name?: string;
      passwordHash?: string;
      isAdmin?: boolean;
      showCheckin?: boolean;
      showCheckout?: boolean;
      showVehicles?: boolean;
      showAlerts?: boolean;
      showHistory?: boolean;
      accessToken?: string | null;
    } = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.passwordHash !== undefined) updateData.passwordHash = data.passwordHash;
    if (data.isAdmin !== undefined) updateData.isAdmin = data.isAdmin;
    if (data.showCheckin !== undefined) updateData.showCheckin = data.showCheckin;
    if (data.showCheckout !== undefined) updateData.showCheckout = data.showCheckout;
    if (data.showVehicles !== undefined) updateData.showVehicles = data.showVehicles;
    if (data.showAlerts !== undefined) updateData.showAlerts = data.showAlerts;
    if (data.showHistory !== undefined) updateData.showHistory = data.showHistory;
    if (data.accessToken !== undefined) updateData.accessToken = data.accessToken;
    return prisma.appUser.update({
      where: { id },
      data: updateData,
    });
  },

  async delete(id: string) {
    return prisma.appUser.delete({
      where: { id },
    });
  },

  async count() {
    return prisma.appUser.count();
  },
};
