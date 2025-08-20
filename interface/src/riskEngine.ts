import geoip from "geoip-lite";
import { UAParser } from "ua-parser-js";

export interface RiskFactors {
  ip?: string;
  userAgent?: string;
  timestamp?: Date;
  method?: string;
  path?: string;
}

const RISK_WEIGHTS = {
  riskyCountry: 30,
  unknownGeo: 20,
  externalIP: 10,
  sensitiveOp: 20,
  anomalousAccess: 15,
  scriptedClient: 20,
  nonBrowserClient: 20,
  missingUserAgent: 15,
  outsideBusinessHours: 20,
  nonStandardDevice: 10,
};

function isPrivateIP(ip: string): boolean {
  return (
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip) ||
    ip === "127.0.0.1" ||
    ip === "::1"
  );
}

export function calculateRiskScore(factors: RiskFactors): number {
  let score = 0;
  const now = factors.timestamp ?? new Date();

  // Normalize IP
  const rawIp = factors.ip ?? "";
  const ip = rawIp.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;

  console.log("Starting risk score calculation...");
  console.log("Evaluating IP:", ip);

  // Location Trust Level
  const geo = geoip.lookup(ip);
  if (geo) {
    console.log(`GeoIP: ${geo.country}, ${geo.city}`);
    const riskyCountries = ["RU", "CN", "KP", "IR"];
    if (riskyCountries.includes(geo.country)) {
      console.log("High-risk country detected, adding", RISK_WEIGHTS.riskyCountry);
      score += RISK_WEIGHTS.riskyCountry;
    }
  } else {
    console.log("Unknown geolocation, adding", RISK_WEIGHTS.unknownGeo);
    score += RISK_WEIGHTS.unknownGeo;
  }

  if (!isPrivateIP(ip)) {
    console.log("External IP detected, adding", RISK_WEIGHTS.externalIP);
    score += RISK_WEIGHTS.externalIP;
  }

  // User Behavior
  const { path, method } = factors;
  if (path && method) {
    const isSensitive = path.includes("/delete") || method === "DELETE";
    const isAnomalous = path.includes("/admin") || path.includes("/secure");

    if (isSensitive) {
      console.log("Sensitive operation detected, adding", RISK_WEIGHTS.sensitiveOp);
      score += RISK_WEIGHTS.sensitiveOp;
    }

    if (isAnomalous) {
      console.log("Anomalous access pattern detected, adding", RISK_WEIGHTS.anomalousAccess);
      score += RISK_WEIGHTS.anomalousAccess;
    }
  }

  // Device Posture (User-Agent Analysis)
  const uaString = factors.userAgent;
  if (uaString) {
    const parser = new UAParser(uaString);
    const ua = parser.getResult();

    console.log("Parsed User-Agent:", ua);

    const clientType = ua.device.type ?? "desktop"; // default to desktop
    if (clientType !== "desktop" && clientType !== "mobile") {
    score += RISK_WEIGHTS.nonStandardDevice;
}
    const isBrowser = ua.browser.name !== undefined;
    const isScriptedClient = ["curl", "axios", "PostmanRuntime", "python", "httpclient", "wget"].some(bot =>
      uaString.toLowerCase().includes(bot)
    );

    if (isScriptedClient) {
      console.log("Scripted client detected, adding", RISK_WEIGHTS.scriptedClient);
      score += RISK_WEIGHTS.scriptedClient;`56`
    } else if (!isBrowser) {
      console.log("Non-browser client detected, adding", RISK_WEIGHTS.nonBrowserClient);
      score += RISK_WEIGHTS.nonBrowserClient;
    }
  } else {
    console.log("Missing User-Agent, adding", RISK_WEIGHTS.missingUserAgent);
    score += RISK_WEIGHTS.missingUserAgent;
  }

  // Time Sensitivity 
  const hour = now.getHours();
  if (hour < 6 || hour > 22) {
    console.log("Access outside business hours, adding", RISK_WEIGHTS.outsideBusinessHours);
    score += RISK_WEIGHTS.outsideBusinessHours;
  }

  // Final Score
  const finalScore = Math.min(score, 100);
  console.log("Final Risk Score:", finalScore);
  return finalScore;
}
