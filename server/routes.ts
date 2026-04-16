import type { Express } from "express";
import type { Server } from "http";

export async function registerRoutes(_httpServer: Server, app: Express): Promise<void> {
  app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });
}
