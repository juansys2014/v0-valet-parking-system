import { Router, Request, Response } from "express";
import { postEntrySchema } from "../validators/entry";
import { createEntry } from "../services/entry.service";
import { json, zodErrorResponse } from "../api/response";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const parsed = postEntrySchema.safeParse(req.body);
    if (!parsed.success) {
      zodErrorResponse(res, parsed.error);
      return;
    }
    const result = await createEntry(parsed.data);
    json(res, result);
  } catch (e) {
    console.error("POST /api/entry", e);
    json(res, { ok: false, error: "Error interno" }, 500);
  }
});

export default router;
