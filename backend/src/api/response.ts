import { Response } from "express";
import { ZodError } from "zod";

export function json<T>(res: Response, data: T, status = 200): void {
  res.status(status).json(data);
}

export function badRequest(res: Response, details: unknown): void {
  res.status(400).json({
    ok: false,
    error: "Validation error",
    details,
  });
}

export function zodErrorResponse(res: Response, error: ZodError): void {
  badRequest(res, error.flatten().fieldErrors);
}
