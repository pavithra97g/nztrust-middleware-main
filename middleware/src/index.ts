import express from "express";
import { calculateRiskScore } from "./riskEngine";
import client from "prom-client";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const PORT = 8080;

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const requestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests received",
  labelNames: ["path", "method"],
});

const riskScoreGauge = new client.Gauge({
  name: "risk_score",
  help: "Last calculated risk score",
});

const highRiskCounter = new client.Counter({
  name: "high_risk_requests_total",
  help: "Number of high-risk requests blocked",
});

register.registerMetric(requestCounter);
register.registerMetric(riskScoreGauge);
register.registerMetric(highRiskCounter);

app.use(express.json());

// Risk assessment middleware
app.use(async (req, res, next) => {
  // Skip risk assessment for metrics and health check endpoints
  if (req.path === "/metrics" || req.path === "/check") {
    return next();
  }

  const forwarded = req.headers["x-forwarded-for"] as string;
  const ip = forwarded ? forwarded.split(",")[0] : req.socket.remoteAddress;

  const factors = {
    ip,
    userAgent: req.headers["user-agent"],
    timestamp: new Date(),
  };

  const riskScore = calculateRiskScore(factors);

  console.log(`Risk Score: ${riskScore} for ${ip} - UA: ${factors.userAgent}`);

  requestCounter.labels(req.path, req.method).inc();
  riskScoreGauge.set(riskScore);

  if (riskScore >= 60) {
    console.error("❌ High risk - access denied.");
    highRiskCounter.inc();
    return res
      .status(403)
      .json({ error: "Access denied due to high risk score." });
  }

  // ✅ IMPORTANT: Call next() to continue to proxy middleware
  next();
});

// ✅ Forward request to actual backend on port 5000
const proxyMiddleware = createProxyMiddleware({
  target: "http://localhost:5000",
  changeOrigin: true,
});

app.use("/api", proxyMiddleware);

// Health check endpoint
app.get("/check", (req, res) => {
  res.json({ message: "Middleware accepted your request." });
});

// Prometheus metrics endpoint
app.get("/metrics", async (_req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.listen(PORT, () => {
  console.log(`Middleware listening on port ${PORT}`);
});
