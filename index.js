const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const connectdb = require("./src/db/db");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const cron = require("node-cron");
require("dotenv").config();

const app = express();
const port = process.env.PORT;

// ===============================
// 🔐 SECURITY MIDDLEWARE
// ===============================

// Limit body size (prevents payload flooding)
app.use(express.json({ limit: "10kb" }));

// Serve static files safely
app.use(express.static("public"));

// Strict CORS (REMOVE duplicate cors())
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

// ===============================
// 🛡️ GLOBAL BASIC RATE LIMIT
// ===============================

const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests. Please slow down.",
});

app.use(globalLimiter);

// ===============================
// 🔐 STRICT REGISTER LIMIT
// ===============================

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Only 10 registration attempts per 15 min per IP
  message: "Too many registration attempts. Try again later.",
});


// ===============================
// 📌 ROUTES
// ===============================

app.get("/ping", (req, res) => res.send("pong"));

app.get("/", (req, res) => {
  res.send("welcome");
});

// IMPORTANT: Apply strict limiter ONLY to register route
const register = require("./src/routes/student");
app.use("/api/v1", registerLimiter, register);

// ❌ Remove public recaptcha route (merge inside register instead)
// const recaptcha = require("./src/routes/recaptcha");
// app.use('/api/v1', recaptcha);

// ===============================
// ⏰ SERVER HEALTH LOG
// ===============================

cron.schedule("*/10 * * * *", () => {
  console.log("Server alive:", new Date().toISOString());
});

// ===============================
// 🚀 START SERVER
// ===============================

app.listen(port, async () => {
  console.log(`${port} is working`);
  await connectdb(process.env.MONGO_URI);
  console.log("Database connected");
});