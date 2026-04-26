const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");
const path = require("path");
const fs = require("fs");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.send("API is running...");
});

// Serve React build generated in /frontend/build
const frontendPath = path.join(__dirname, "..", "frontend", "build");
const indexPath = path.join(frontendPath, "index.html");

if (fs.existsSync(indexPath)) {
  app.use(express.static(frontendPath));

  // React SPA fallback
  app.get("*", (req, res) => {
    res.sendFile(indexPath);
  });
} else {
  app.get("/", (req, res) => {
    res.status(200).send("API is running, frontend build is missing.");
  });
}

const PORT = process.env.PORT || 5000;

// MongoDB connection then start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Atlas connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));