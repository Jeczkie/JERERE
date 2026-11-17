const express = require("express");
const path = require("path");
const os = require("os");

const app = express();
const PORT = process.env.PORT || 3000;

let requestCount = 0;

app.use((req, res, next) => {
  requestCount++;
  next();
});

// Connect Express to the "public" folder (serves public/index.html automatically)
app.use(express.static(path.join(__dirname, "public")));

// Live telemetry endpoint for the anime dashboard
app.get("/api/status", (req, res) => {
  const mem = process.memoryUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const memPercent = Math.min(99, Math.round(((totalMem - freeMem) / totalMem) * 100));
  const cpuLoad = os.loadavg()[0];
  const cpuPercent = Math.min(99, Math.max(4, Math.round((cpuLoad / os.cpus().length) * 100) || 18));

  res.json({
    status: "ONLINE",
    pilot: "Jerecho Marquez",
    domain: "jerere-production.up.railway.app",
    port: PORT,
    uptimeSeconds: Math.floor(process.uptime()),
    cpuPercent,
    memPercent,
    rssMB: (mem.rss / 1024 / 1024).toFixed(1),
    requests: requestCount,
    nodeVersion: process.version
  });
});

app.listen(PORT, () => console.log(`Running on port ${PORT}`));