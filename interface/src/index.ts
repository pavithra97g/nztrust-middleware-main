import express from "express";
import { calculateRiskScore } from "./riskEngine";
import client from "prom-client";
import cors from "cors";
import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";
import { Request } from "express-serve-static-core";
import { ParsedQs } from "qs";
import jwt from "jsonwebtoken";

const app = express();
const PORT = 8080;
const BACKEND_BASE_URL = "http://service1:5000";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const register = new client.Registry();

client.collectDefaultMetrics({
  register,
});

const requestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests received",
  registers: [register],
});

const riskScoreGauge = new client.Gauge({
  name: "risk_score",
  help: "Last calculated risk score",
  labelNames: ["ip"],
  registers: [register],
});

const highRiskCounter = new client.Counter({
  name: "high_risk_requests_total",
  help: "Number of high-risk requests blocked",
  registers: [register],
});

const mediumRiskCounter = new client.Counter({
  name: "medium_risk_requests_total",
  help: "Number of medium-risk requests forwarded with caution",
  registers: [register],
});

const lowRiskCounter = new client.Counter({
  name: "low_risk_requests_total",
  help: "Number of low-risk requests accepted normally",
  registers: [register],
});

// Health check
app.get("/check", (req, res) => {
  // Increment counter for health checks too
  // requestCounter.labels(req.path, req.method, "200").inc();
  res.json({ message: "interface accepted your request." });
});

// Prometheus metrics
app.get("/metrics", async (req, res) => {
  try {
    // Increment counter for metrics endpoint
    // requestCounter.labels(req.path, req.method, "200").inc();

    res.setHeader("Content-Type", register.contentType);
    const metrics = await register.metrics();

    console.log("Serving metrics, sample data:");
    console.log("- Request counter:", await requestCounter.get());
    console.log("- Risk gauge:", await riskScoreGauge.get());

    res.end(metrics);
  } catch (error) {
    console.error("Error generating metrics:", error);
    res.status(500).json({ error: "Failed to generate metrics" });
  }
});

// Global interface to track ALL requests
// app.use((req, res, next) => {
//   // Track the original end function
//   const originalEnd = res.end;

//   // Override res.end to capture response status
//   res.end = function (
//     chunk?: any,
//     encoding?: BufferEncoding | (() => void),
//     cb?: () => void
//   ): any {
//     // Increment request counter with actual status code
//     requestCounter
//       .labels(req.path, req.method, res.statusCode.toString())
//       .inc();

//     // Call original end function
//     // @ts-ignore
//     return originalEnd.apply(this, arguments);
//   };

//   next();
// });
// app.use((req, res, next) => {
//   const start = Date.now();

//   res.on("finish", () => {
//     // Get the HTTP status after response is sent
//     const statusCode = res.statusCode;

//     // Normalize paths if needed to avoid high cardinality in Prometheus
//     const normalizedPath = req.route?.path || req.path;

//     requestCounter
//       .labels(normalizedPath, req.method, statusCode.toString())
//       .inc();

//     console.log(
//       `Request ${req.method} ${req.originalUrl} -> ${statusCode} in ${
//         Date.now() - start
//       }ms`
//     );
//   });

//   next();
// });

const calculateAndTrackRisk = (
  req: Request<{}, any, any, ParsedQs, Record<string, any>>
) => {
  const forwarded = req.headers["x-forwarded-for"] as string;

  const ip = forwarded
    ? forwarded.split(",")[0]
    : req.socket.remoteAddress || "unknown";

  const factors = {
    ip,
    userAgent: req.headers["user-agent"],
    timestamp: new Date(),
    method: req.method,
    path: req.path,
  };

  const riskScore = calculateRiskScore(factors);

  riskScoreGauge.labels(ip).set(riskScore);

  return { riskScore, ip };
};

app.use(async (req, res, next) => {
  // Skip interface for public endpoints
  if (
    req.path === "/metrics" ||
    req.path === "/check" ||
    req.path.startsWith("/api/login")
  ) {
    console.log("Skipping risk check for:", req.path);
    return next();
  }

  // Check JWT token for protected routes
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    //! Verify JWT token
    const payload = jwt.verify(token, "a-string-secret-at-least-256-bits-long");
    console.log("Token verified:", payload);
    next();
  } catch (error) {
    if (error instanceof Error) {
      console.log("Invalid token:", error.message);
    } else {
      console.log("Invalid token:", error);
    }
    return res.status(403).json({ error: "Invalid token" });
  }
});

// API proxy for protected routes - AFTER auth interface
app.use(
  "/api",
  async (req, res, next) => {
    requestCounter.inc();
    const { riskScore, ip } = calculateAndTrackRisk(req);
    res.setHeader("x-risk-score", String(riskScore));

    if (riskScore >= 60) {
      highRiskCounter.inc();
      console.log(`API HIGH RISK: Blocking ${ip} with score ${riskScore}`);
      return res
        .status(403)
        .json({ error: "Access denied due to high risk score." });
    } else if (riskScore >= 30) {
      mediumRiskCounter.inc();
      console.log(`API MEDIUM RISK: ${ip} with score ${riskScore}`);
    } else {
      lowRiskCounter.inc();
      console.log(`API LOW RISK: ${ip} with score ${riskScore}`);
    }

    next();
  },
  createProxyMiddleware({
    target: "http://service1:5000",
    changeOrigin: true,
    pathRewrite: { "^/api": "" },
    on: {
      proxyReq: (proxyReq, req, res) => {
        console.log(
          `API Proxy: ${req.method} ${req.url} -> ${BACKEND_BASE_URL}${proxyReq.path}`
        );
        fixRequestBody(proxyReq, req);
      },
      proxyRes: (proxyRes, req, res) => {
        console.log(`API Response: ${proxyRes.statusCode} from service1`);
      },
      error: (err, req, res) => {
        console.error("API Proxy Error:", err.message);
        const expressRes = res as unknown as express.Response;
        return expressRes.status(500).json({
          error: "API service unavailable",
          message: err.message,
        });
      },
    },
  })
);

// 404 handler
app.use("*", (req, res) => {
  console.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`interface Service running on port ${PORT}`);
});
