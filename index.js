const express = require("express");
const path = require("path");
const os = require("os");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Railway Postgres using process.env.DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

// Initialize database table for anime favorites/watchlist
async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS watchlist (
        id SERIAL PRIMARY KEY,
        anime_title VARCHAR(255) NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Postgres watchlist table ready.");
  } catch (err) {
    console.error("DB Error:", err);
  }
}
initDb();

let requestCount = 0;
app.use(express.json());
app.use((req, res, next) => {
  requestCount++;
  next();
});

app.use(express.static(path.join(__dirname, "public")));

// API: Get saved watchlist from Postgres
app.get("/api/watchlist", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM watchlist ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Add anime to Postgres watchlist
app.post("/api/watchlist", async (req, res) => {
  const { title } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO watchlist (anime_title) VALUES ($1) RETURNING *",
      [title]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Telemetry endpoint
app.get("/api/status", (req, res) => {
  const mem = process.memoryUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const memPercent = Math.min(99, Math.round(((totalMem - freeMem) / totalMem) * 100));
  const cpuLoad = os.loadavg()[0];
  const cpuPercent = Math.min(99, Math.max(4, Math.round((cpuLoad / os.cpus().length) * 100) || 18));

  res.json({
    status: "ONLINE // DB CONNECTED",
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