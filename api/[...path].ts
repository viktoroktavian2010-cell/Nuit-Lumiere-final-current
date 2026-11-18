import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { publicPlatformScript } from "../server/_core/publicConfig";
import { appRouter } from "../server/routers";
import * as db from "../server/db";
import { liqpayPublicKeyMatches, verifyLiqPayCallback } from "../server/liqpay";
import { createContext } from "../server/_core/context";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Vercel's catch-all function may receive the path with or without the /api
// prefix depending on how the request is routed. Normalize it for the same
// Express routes used by the standalone server.
app.use((req, _res, next) => {
  if (req.path !== "/api" && !req.path.startsWith("/api/")) {
    req.url = `/api${req.url}`;
  }
  next();
});

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
app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));

export default app;
