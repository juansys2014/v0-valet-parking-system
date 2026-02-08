import { Router, Request, Response } from "express";
import { getAlerts } from "../services/alerts.service";
import { json } from "../api/response";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const data = await getAlerts();
    json(res, { ok: true, ...data });
  } catch (e) {
    console.error("GET /api/alerts", e);
    json(res, { ok: false, error: "Error interno" }, 500);
  }
});

export default router;
