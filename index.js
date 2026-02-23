const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const connectdb = require("./src/db/db");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");
const cron = require("node-cron");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// ==================================================
// 🔥 VERY IMPORTANT (Fix for Render + Cloudflare)
// ==================================================
app.set("trust proxy", 1);

// ==================================================
// 🔐 SECURITY MIDDLEWARE
// ==================================================
app.use(express.json({ limit: "10kb" })); // Limit JSON size
app.use(express.static("public"));        // Serve static files safely

app.use(
  cors({
    origin: [
      "https://registerpage-1a46.vercel.app",
      "https://www.ossrndc.in",
      "https://registerpage-phi.vercel.app",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ==================================================
// 🛡️ GLOBAL API RATE LIMIT (General Protection)
// ==================================================

// Slow down if excessive requests
const speedLimiter = slowDown({
  windowMs: 60 * 1000,  // 1 minute
  delayAfter: 300,      // start delaying after 300 requests
  delayMs: 50,          // add 50ms per extra request
});

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 500,             // allow 500 API requests per IP per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests. Please slow down.",
});

app.use("/api", speedLimiter, globalLimiter);

// ==================================================
// 🔐 REGISTER RATE LIMIT (100 per minute per IP)
// ==================================================
const registerLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 100,             // 100 registrations per IP per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many registration attempts. Please try again in a minute.",
});

// ==================================================
// 📌 ROUTES
// ==================================================
app.get("/ping", (req, res) => res.status(200).send("pong")); // Keep-alive route

app.get("/", (req, res) => res.send("welcome"));

// Apply strict limiter only to registration routes
const register = require("./src/routes/student");
app.use("/api/v2", registerLimiter, register);

// ==================================================
// ⏰ SERVER HEALTH LOG (Optional)
// ==================================================
cron.schedule("*/1 * * * *", () => {
  console.log("Server alive:", new Date().toISOString());
});

// ==================================================
// 🚀 START SERVER
// ==================================================
app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  await connectdb(process.env.MONGO_URI);
  console.log("Database connected");
});

// ==================================================
// ⚠️ ERROR HANDLING (Prevents Crashes)
// ==================================================
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});