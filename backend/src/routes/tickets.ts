import { Router, Request, Response } from "express";
import { postReadySchema, postDeliveredSchema } from "../validators/tickets";
import { markReady, markDelivered } from "../services/tickets.service";
import { json, zodErrorResponse } from "../api/response";

const router = Router();

router.post("/:id/ready", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body ?? {};
    const parsed = postReadySchema.safeParse(body);
    if (!parsed.success) {
      zodErrorResponse(res, parsed.error);
      return;
    }
    const result = await markReady(id, parsed.data);
    if (!result.ok) {
      json(res, { ok: false, error: result.error }, 404);
      return;
    }
    json(res, result);
  } catch (e) {
    console.error("POST /api/tickets/:id/ready", e);
    json(res, { ok: false, error: "Error interno" }, 500);
  }
});

router.post("/:id/delivered", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body ?? {};
    const parsed = postDeliveredSchema.safeParse(body);
    if (!parsed.success) {
      zodErrorResponse(res, parsed.error);
      return;
    }
    const result = await markDelivered(id, parsed.data);
    if (!result.ok) {
      json(res, { ok: false, error: result.error }, 404);
      return;
    }
    json(res, result);
  } catch (e) {
    console.error("POST /api/tickets/:id/delivered", e);
    json(res, { ok: false, error: "Error interno" }, 500);
  }
});

export default router;
