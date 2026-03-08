import { Request, Response, NextFunction } from "express";
import { AppUser } from "@prisma/client";
import { userRepository } from "../repositories/user.repository";
import { json } from "../api/response";

export type AuthRequest = Request & { user?: AppUser | null };

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const token =
    typeof authHeader === "string" && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : null;
  if (!token) {
    req.user = null;
    next();
    return;
  }
  try {
    const user = await userRepository.findByToken(token);
    req.user = user ?? null;
  } catch {
    req.user = null;
  }
  next();
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    json(res, { ok: false, error: "No autorizado" }, 401);
    return;
  }
  next();
}

export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    json(res, { ok: false, error: "No autorizado" }, 401);
    return;
  }
  if (!req.user.isAdmin) {
    json(res, { ok: false, error: "Se requieren permisos de administrador" }, 403);
    return;
  }
  next();
}
