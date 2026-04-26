const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ ok: true, service: "mini-tache-api" });
});

// Frontend static (works if artifact contains frontend/build)
const frontendPath = path.join(__dirname, "..", "frontend", "build");
const indexPath = path.join(frontendPath, "index.html");
const hasFrontendBuild = fs.existsSync(indexPath);

console.log("Frontend path:", frontendPath);
console.log("Frontend build found:", hasFrontendBuild);

if (hasFrontendBuild) {
  app.use(express.static(frontendPath));

  // SPA fallback for non-API routes only
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    return res.sendFile(indexPath);
  });
} else {
  // Keep app alive even if frontend is missing in deployment package
  app.get("/", (req, res) => {
    res.status(200).send("API is running. Frontend build is not deployed.");
  });
}

// API 404
app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  if (res.headersSent) return next(err);
  return res.status(500).json({ message: "Internal server error" });
});

const PORT = Number(process.env.PORT) || 8080;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI is missing");
  process.exit(1);
}

let server;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB Atlas connected");
    server = app.listen(PORT, "0.0.0.0", () => {
      console.log("Server running on port", PORT);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Graceful shutdown for Azure restarts
const shutdown = (signal) => {
  console.log(signal, "received. Shutting down gracefully...");
  if (server) {
    server.close(() => {
      mongoose.connection.close(false).then(() => process.exit(0));
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));