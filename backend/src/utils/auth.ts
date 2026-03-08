import crypto from "crypto";

/**
 * Mismo algoritmo que el frontend (SHA-256) para compatibilidad.
 */
export function hashPassword(plain: string): string {
  return crypto.createHash("sha256").update(plain, "utf8").digest("hex");
}

export function verifyPassword(plain: string, hash: string): boolean {
  if (!hash) return false;
  return hashPassword(plain) === hash;
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
