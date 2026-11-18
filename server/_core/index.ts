import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { publicPlatformScript } from "./publicConfig";
import { appRouter } from "../routers";
import * as db from "../db";
import { liqpayPublicKeyMatches, verifyLiqPayCallback } from "../liqpay";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.get("/api/platform/config.js", (_req, res) => {
    res.set("Cache-Control", "no-store").type("application/javascript").send(publicPlatformScript());
  });
  app.post("/api/liqpay/callback", async (req, res) => {
    const data = typeof req.body?.data === "string" ? req.body.data : "";
    const signature = typeof req.body?.signature === "string" ? req.body.signature : "";
    const payload = verifyLiqPayCallback(data, signature);
    if (!payload || !liqpayPublicKeyMatches(payload.public_key)) {
      res.status(400).json({ error: "Invalid LiqPay signature" });
      return;
    }
    const orderId = typeof payload.order_id === "string" ? payload.order_id : "";
    const status = typeof payload.status === "string" ? payload.status : "";
    const amount = Number(payload.amount);
    const currency = typeof payload.currency === "string" ? payload.currency : "";
    if (!orderId || !status || currency !== "UAH" || !Number.isFinite(amount) || !(await db.checkOrderAmount(orderId, amount, currency))) {
      res.status(400).json({ error: "Callback does not match the stored order" });
      return;
    }
    await db.updateLiqPayStatus(orderId, status, status === "success");
    res.status(200).send("ok");
  });
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = Number(process.env.PORT || "3000");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid PORT");
  server.on("error", error => { console.error("Server failed:", error.message); process.exit(1); });
  server.listen(port, "0.0.0.0", () => console.log(`Server listening on port ${port}`));
}

startServer().catch(error => { console.error(error); process.exit(1); });
