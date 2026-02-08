import "dotenv/config";
import express from "express";
import cors from "cors";
import apiRoutes from "./routes";

const app = express();
const PORT = process.env.PORT ?? 4000;

const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3000";
const corsOrigins = corsOrigin.split(",").map((s) => s.trim()).filter(Boolean);
app.use(cors({ origin: corsOrigins.length > 0 ? corsOrigins : "http://localhost:3000" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, status: "ok" });
});

app.use("/api", apiRoutes);

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
