import { Router, Request, Response } from "express";
import {
  postCheckoutRequestSchema,
  postQuickExitSchema,
} from "../validators/checkout";
import { requestCheckout, quickExit } from "../services/checkout.service";
import { json, zodErrorResponse } from "../api/response";

const router = Router();

router.post("/request", async (req: Request, res: Response) => {
  try {
    const parsed = postCheckoutRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      zodErrorResponse(res, parsed.error);
      return;
    }
    const result = await requestCheckout(parsed.data);
    if (!result.ok) {
      json(res, { ok: false, error: result.error }, 404);
      return;
    }
    json(res, result);
  } catch (e) {
    console.error("POST /api/checkout/request", e);
    json(res, { ok: false, error: "Error interno" }, 500);
  }
});

router.post("/quick-exit", async (req: Request, res: Response) => {
  try {
    const parsed = postQuickExitSchema.safeParse(req.body);
    if (!parsed.success) {
      zodErrorResponse(res, parsed.error);
      return;
    }
    const result = await quickExit(parsed.data);
    json(res, result);
  } catch (e) {
    console.error("POST /api/checkout/quick-exit", e);
    json(res, { ok: false, error: "Error interno" }, 500);
  }
});

export default router;
