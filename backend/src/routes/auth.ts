import { Response } from "express";
import { Router } from "express";
import { userRepository } from "../repositories/user.repository";
import { verifyPassword, generateToken } from "../utils/auth";
import { json } from "../api/response";
import { authMiddleware, type AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

function toPublicUser(user: { id: string; name: string; isAdmin: boolean; showCheckin: boolean; showCheckout: boolean; showVehicles: boolean; showAlerts: boolean; showHistory: boolean }) {
  return {
    id: user.id,
    name: user.name,
    isAdmin: Boolean(user.isAdmin),
    showCheckin: user.showCheckin,
    showCheckout: user.showCheckout,
    showVehicles: user.showVehicles,
    showAlerts: user.showAlerts,
    showHistory: user.showHistory,
  };
}

/** POST /api/auth/login — name + password, devuelve token y usuario */
router.post("/login", async (req, res: Response) => {
  try {
    const { name, password } = req.body as { name?: string; password?: string };
    const nameStr = typeof name === "string" ? name.trim() : "";
    if (!nameStr) {
      json(res, { ok: false, error: "Nombre requerido" }, 400);
      return;
    }
    const user = await userRepository.findByName(nameStr);
    if (!user) {
      json(res, { ok: false, error: "Usuario no encontrado" }, 401);
      return;
    }
    if (user.passwordHash && typeof password === "string") {
      const valid = verifyPassword(password, user.passwordHash);
      if (!valid) {
        json(res, { ok: false, error: "Contraseña incorrecta" }, 401);
        return;
      }
    }
    const token = generateToken();
    await userRepository.update(user.id, { accessToken: token });
    json(res, {
      ok: true,
      token,
      user: toPublicUser(user),
    });
  } catch (e) {
    console.error("POST /api/auth/login", e);
    json(res, { ok: false, error: "Error interno" }, 500);
  }
});

/** GET /api/auth/validate?userId=xxx&token=xxx — para acceso por QR */
router.get("/validate", async (req, res: Response) => {
  try {
    const userId = typeof req.query.userId === "string" ? req.query.userId.trim() : "";
    const token = typeof req.query.token === "string" ? req.query.token.trim() : "";
    if (!userId || !token) {
      json(res, { ok: false, error: "userId y token requeridos" }, 400);
      return;
    }
    const user = await userRepository.findById(userId);
    if (!user || user.accessToken !== token) {
      json(res, { ok: false, error: "Token inválido" }, 401);
      return;
    }
    json(res, { ok: true, user: toPublicUser(user) });
  } catch (e) {
    console.error("GET /api/auth/validate", e);
    json(res, { ok: false, error: "Error interno" }, 500);
  }
});

/** GET /api/auth/me — usuario actual por token en header (opcional, para refrescar datos) */
router.get("/me", async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    json(res, { ok: false, error: "No autorizado" }, 401);
    return;
  }
  json(res, { ok: true, user: toPublicUser(req.user) });
});

export default router;
