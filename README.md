Added 
- Login page
- Auth Api
- Added todo page

📊 Why This Is Better than Just a WAF
Your middleware:

Is customizable — you control the risk logic

Can adapt behavior over time (add GeoIP, session tracking, ML scoring)

Is observed via Prometheus & Grafana

Is privacy aware, as it logs only essential metadata

| Feature                         | Middleware Role                           |
| ------------------------------- | ----------------------------------------- |
| Request filtering               | YES — based on real-time scoring          |
| Protect `service1` from bots    | YES — blocks `curl`, `postman`, etc.      |
| Observability (Prometheus)      | YES — risk metrics, high-risk attempts    |
| Fine-grained control            | YES — full scoring logic is in your hands |
| Works as a Zero/Near-Zero Trust | YES — evaluates *every* request           |
| Service  isolation              | YES — exposed only via middleware proxy   |


🔐 Bonus: Protect from Lateral Movement
Later, you can extend it with:

JWT/OAuth verification (Authorization headers)

Session/device fingerprinting

Rate limiting per IP or token

Anomaly detection (e.g., sudden behavior shifts)

