import { Response } from "express";
import { Router } from "express";
import { settingsRepository } from "../repositories/settings.repository";
import { userRepository } from "../repositories/user.repository";
import { hashPassword, generateToken } from "../utils/auth";
import { json } from "../api/response";
import { authMiddleware, requireAuth, requireAdmin, type AuthRequest } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

function toPublicUser(user: { id: string; name: string; isAdmin: boolean; showCheckin: boolean; showCheckout: boolean; showVehicles: boolean; showAlerts: boolean; showHistory: boolean }) {
  const isAdmin = Boolean(user.isAdmin) || user.name === "Admin";
  return {
    id: user.id,
    name: user.name,
    isAdmin,
    showCheckin: user.showCheckin,
    showCheckout: user.showCheckout,
    showVehicles: user.showVehicles,
    showAlerts: user.showAlerts,
    showHistory: user.showHistory,
  };
}

/** GET /api/config/logo — público; devuelve la imagen del logo de la empresa (para PWA / icono instalable) */
router.get("/logo", async (_req, res: Response) => {
  try {
    const row = await settingsRepository.get();
    const dataUrl = row?.logo;
    if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
      res.status(404).end();
      return;
    }
    const match = dataUrl.match(/^data:(image\/[a-z+]+);base64,(.+)$/i);
    if (!match) {
      res.status(404).end();
      return;
    }
    const mime = match[1];
    const base64 = match[2];
    const buf = Buffer.from(base64, "base64");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("Content-Type", mime);
    res.send(buf);
  } catch (e) {
    console.error("GET /api/config/logo", e);
    res.status(500).end();
  }
});

/** GET /api/config/settings — público (logo, companyName, campos visibles); sin caché para que todos los clientes vean lo mismo */
router.get("/settings", async (_req, res: Response) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  try {
    const row = await settingsRepository.get();
    json(res, {
      companyName: row?.companyName ?? "Valet Parking",
      logo: row?.logo ?? null,
      showLicensePlate: row?.showLicensePlate ?? true,
      showParkingSpot: row?.showParkingSpot ?? true,
      showAttendantName: row?.showAttendantName ?? true,
      showMedia: row?.showMedia ?? true,
      showNotes: row?.showNotes ?? true,
    });
  } catch (e) {
    console.error("GET /api/config/settings", e);
    json(res, { ok: false, error: "Error interno" }, 500);
  }
});

/** PUT /api/config/settings — admin: actualizar companyName, logo y/o campos visibles */
router.put("/settings", requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body as {
      companyName?: string;
      logo?: string | null;
      showLicensePlate?: boolean;
      showParkingSpot?: boolean;
      showAttendantName?: boolean;
      showMedia?: boolean;
      showNotes?: boolean;
    };
    await settingsRepository.update({
      ...(typeof body.companyName === "string" && { companyName: body.companyName.trim() }),
      ...(body.logo !== undefined && { logo: body.logo === null || body.logo === "" ? null : String(body.logo) }),
      ...(typeof body.showLicensePlate === "boolean" && { showLicensePlate: body.showLicensePlate }),
      ...(typeof body.showParkingSpot === "boolean" && { showParkingSpot: body.showParkingSpot }),
      ...(typeof body.showAttendantName === "boolean" && { showAttendantName: body.showAttendantName }),
      ...(typeof body.showMedia === "boolean" && { showMedia: body.showMedia }),
      ...(typeof body.showNotes === "boolean" && { showNotes: body.showNotes }),
    });
    const row = await settingsRepository.get();
    json(res, {
      companyName: row?.companyName ?? "Valet Parking",
      logo: row?.logo ?? null,
      showLicensePlate: row?.showLicensePlate ?? true,
      showParkingSpot: row?.showParkingSpot ?? true,
      showAttendantName: row?.showAttendantName ?? true,
      showMedia: row?.showMedia ?? true,
      showNotes: row?.showNotes ?? true,
    });
  } catch (e) {
    console.error("PUT /api/config/settings", e);
    json(res, { ok: false, error: "Error interno" }, 500);
  }
});

/** GET /api/config/me — usuario actual (requiere token) */
router.get("/me", requireAuth, async (req: AuthRequest, res: Response) => {
  if (!req.user) return;
  json(res, { ok: true, user: toPublicUser(req.user) });
});

/** GET /api/config/users — lista de usuarios (solo admin, sin passwordHash) */
router.get("/users", requireAdmin, async (_req, res: Response) => {
  try {
    const users = await userRepository.list();
    json(res, { users: users.map(toPublicUser) });
  } catch (e) {
    console.error("GET /api/config/users", e);
    json(res, { ok: false, error: "Error interno" }, 500);
  }
});

/** POST /api/config/users — crear usuario (solo admin) */
router.post("/users", requireAdmin, async (req, res: Response) => {
  try {
    const body = req.body as {
      name?: string;
      password?: string;
      isAdmin?: boolean;
      showCheckin?: boolean;
      showCheckout?: boolean;
      showVehicles?: boolean;
      showAlerts?: boolean;
      showHistory?: boolean;
    };
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      json(res, { ok: false, error: "Nombre requerido" }, 400);
      return;
    }
    const existing = await userRepository.findByName(name);
    if (existing) {
      json(res, { ok: false, error: "Ya existe un usuario con ese nombre" }, 400);
      return;
    }
    const passwordHash = typeof body.password === "string" && body.password.trim()
      ? hashPassword(body.password.trim())
      : "";
    const token = generateToken();
    const user = await userRepository.create({
      name,
      passwordHash,
      isAdmin: Boolean(body.isAdmin),
      showCheckin: body.showCheckin !== false,
      showCheckout: body.showCheckout !== false,
      showVehicles: body.showVehicles !== false,
      showAlerts: body.showAlerts !== false,
      showHistory: body.showHistory !== false,
      accessToken: token,
    });
    json(res, { ok: true, user: toPublicUser(user) });
  } catch (e) {
    console.error("POST /api/config/users", e);
    json(res, { ok: false, error: "Error interno" }, 500);
  }
});

/** PATCH /api/config/users/:id — actualizar usuario (solo admin) */
router.patch("/users/:id", requireAdmin, async (req, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body as {
      name?: string;
      password?: string;
      isAdmin?: boolean;
      showCheckin?: boolean;
      showCheckout?: boolean;
      showVehicles?: boolean;
      showAlerts?: boolean;
      showHistory?: boolean;
    };
    const existing = await userRepository.findById(id);
    if (!existing) {
      json(res, { ok: false, error: "Usuario no encontrado" }, 404);
      return;
    }
    const updates: Parameters<typeof userRepository.update>[1] = {};
    if (typeof body.name === "string") updates.name = body.name.trim();
    if (body.isAdmin !== undefined) updates.isAdmin = Boolean(body.isAdmin);
    if (body.showCheckin !== undefined) updates.showCheckin = Boolean(body.showCheckin);
    if (body.showCheckout !== undefined) updates.showCheckout = Boolean(body.showCheckout);
    if (body.showVehicles !== undefined) updates.showVehicles = Boolean(body.showVehicles);
    if (body.showAlerts !== undefined) updates.showAlerts = Boolean(body.showAlerts);
    if (body.showHistory !== undefined) updates.showHistory = Boolean(body.showHistory);
    if (typeof body.password === "string" && body.password.trim()) {
      updates.passwordHash = hashPassword(body.password.trim());
    }
    const user = await userRepository.update(id, updates);
    json(res, { ok: true, user: toPublicUser(user) });
  } catch (e) {
    console.error("PATCH /api/config/users/:id", e);
    json(res, { ok: false, error: "Error interno" }, 500);
  }
});

/** DELETE /api/config/users/:id — eliminar usuario (solo admin) */
router.delete("/users/:id", requireAdmin, async (req, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await userRepository.findById(id);
    if (!existing) {
      json(res, { ok: false, error: "Usuario no encontrado" }, 404);
      return;
    }
    const count = await userRepository.count();
    if (count <= 1) {
      json(res, { ok: false, error: "No se puede eliminar el último usuario" }, 400);
      return;
    }
    await userRepository.delete(id);
    json(res, { ok: true });
  } catch (e) {
    console.error("DELETE /api/config/users/:id", e);
    json(res, { ok: false, error: "Error interno" }, 500);
  }
});

/** POST /api/config/users/:id/regenerate-token — nuevo token para QR (solo admin) */
router.post("/users/:id/regenerate-token", requireAdmin, async (req, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userRepository.findById(id);
    if (!user) {
      json(res, { ok: false, error: "Usuario no encontrado" }, 404);
      return;
    }
    const token = generateToken();
    await userRepository.update(id, { accessToken: token });
    json(res, { ok: true, token });
  } catch (e) {
    console.error("POST /api/config/users/:id/regenerate-token", e);
    json(res, { ok: false, error: "Error interno" }, 500);
  }
});

export default router;
