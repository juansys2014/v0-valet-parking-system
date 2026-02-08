import { Router, Request, Response } from "express";
import { ticketRepository } from "../repositories/ticket.repository";
import { json } from "../api/response";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const search = (_req.query.search as string) ?? undefined;
    const tickets = await ticketRepository.findManyDelivered(search);
    json(res, { ok: true, tickets });
  } catch (e) {
    console.error("GET /api/history", e);
    json(res, { ok: false, error: "Error interno" }, 500);
  }
});

export default router;
