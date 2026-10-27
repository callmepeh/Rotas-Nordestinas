const express = require("express");

const app = express();
app.use(express.json({ limit: "12mb" }));
const PORT = Number(process.env.PORT || 5000);
const identity = process.env.IDENTITY_SERVICE_URL || "http://identity:3001";
const destinations = process.env.DESTINATIONS_SERVICE_URL || "http://destinations:3002";

app.get("/health", async (_req, res) => {
  const checks = await Promise.all([identity, destinations].map(async (base) => {
    try { const response = await fetch(`${base}/health`, { signal: AbortSignal.timeout(1500) }); return response.ok; }
    catch { return false; }
  }));
  res.status(checks.every(Boolean) ? 200 : 503).json({ status: checks.every(Boolean) ? "ok" : "degraded", services: { identity: checks[0], destinations: checks[1] } });
});

app.all("/api/*path", async (req, res) => {
  const targetBase = req.path.startsWith("/api/auth/") ? identity : destinations;
  const target = `${targetBase}${req.originalUrl}`;
  try {
    const headers = new Headers();
    for (const [name, value] of Object.entries(req.headers)) {
      if (value && !["host", "content-length", "connection"].includes(name)) headers.set(name, Array.isArray(value) ? value.join(",") : value);
    }
    const response = await fetch(target, {
      method: req.method,
      headers,
      body: ["GET", "HEAD"].includes(req.method) ? undefined : JSON.stringify(req.body ?? {}),
      signal: AbortSignal.timeout(12000),
    });
    const body = await response.arrayBuffer();
    res.status(response.status);
    response.headers.forEach((value, name) => { if (!["content-encoding", "transfer-encoding"].includes(name)) res.setHeader(name, value); });
    res.send(Buffer.from(body));
  } catch (error) {
    console.error("gateway upstream failure", req.originalUrl, error.message);
    res.status(503).json({ error: "Serviço temporariamente indisponível." });
  }
});

if (require.main === module) app.listen(PORT, "0.0.0.0", () => console.log(`API Gateway listening on ${PORT}`));
module.exports = app;
