const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const connectdb = require("./src/db/db");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
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

// Limit JSON body size
app.use(express.json({ limit: "10kb" }));

// Serve static files
app.use(express.static("public"));

// Strict CORS configuration
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

const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // Allow 300 API requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests. Please slow down.",
});

// Apply ONLY to API routes
app.use("/api", globalLimiter);

// ==================================================
// 🔐 REGISTER RATE LIMIT (100 per minute)
// ==================================================

const registerLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // ✅ 100 registrations per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many registration attempts. Please try again in a minute.",
});

// ==================================================
// 📌 ROUTES
// ==================================================

app.get("/ping", (req, res) => res.send("pong"));

app.get("/", (req, res) => {
  res.send("welcome");
});

// Apply strict limiter ONLY to registration routes
const register = require("./src/routes/student");
app.use("/api/v1", registerLimiter, register);

// ==================================================
// ⏰ SERVER HEALTH LOG (Optional)
// ==================================================

cron.schedule("*/10 * * * *", () => {
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