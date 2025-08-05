import geoip from "geoip-lite";

export interface RiskFactors {
  ip?: string;
  userAgent?: string;
  timestamp?: Date;
  method?: string;
  path?: string;
}

export function calculateRiskScore(factors: RiskFactors): number {
  let score = 0;
  const now = factors.timestamp ?? new Date();

  // Normalize IP
  const rawIp = factors.ip ?? "";
  const ip = rawIp.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;

  console.log("Starting risk score calculation...");
  console.log("Evaluating IP:", ip);

  // --- Location Trust Level ---
  const geo = geoip.lookup(ip);
  if (geo) {
    console.log(`GeoIP: ${geo.country}, ${geo.city}`);
    const riskyCountries = ["RU", "CN", "KP", "IR"];
    if (riskyCountries.includes(geo.country)) {
      console.log("High-risk country detected, adding 25");
      score += 25;
    }
  } else {
    console.log("Unknown geolocation, adding 10");
    score += 10;
  }

  if (!ip.startsWith("192.168") && ip !== "127.0.0.1") {
    console.log("External IP, adding 10");
    score += 10;
  }

  // --- User Behavior ---
  if (factors.path && factors.method) {
    const isSensitive = factors.path.includes("/delete") || factors.method === "DELETE";
    const isAnomalous = factors.path.includes("/admin") || factors.path.includes("/secure");

    if (isSensitive) {
      console.log("Sensitive operation detected, adding 20");
      score += 20;
    }
    if (isAnomalous) {
      console.log("Anomalous access pattern detected, adding 15");
      score += 15;
    }
  }

  // --- Device Posture (via User-Agent) ---
  if (factors.userAgent) {
    const ua = factors.userAgent.toLowerCase();
    console.log("User-Agent:", ua);

    if (ua.includes("curl") || ua.includes("postman")) {
      console.log("Scripted client detected, adding 20");
      score += 20;
    } else if (!ua.includes("mozilla")) {
      console.log("Non-browser client, adding 10");
      score += 10;
    }
  } else {
    console.log("Missing User-Agent, adding 15");
    score += 15;
  }

  // --- Time Sensitivity ---
  const hour = now.getHours();
  if (hour < 6 || hour > 22) {
    console.log("Access outside business hours, adding 20");
    score += 20;
  }

  // Clamp score to 0–100
  const finalScore = Math.min(score, 100);
  console.log("Final Risk Score:", finalScore);
  return finalScore;
}
