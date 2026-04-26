const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");

const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

// 🔥 FORCE FRONTEND (sans condition)
const frontendPath = path.join(__dirname, "..", "frontend", "build");
const indexPath = path.join(frontendPath, "index.html");

console.log("📁 FRONTEND PATH:", frontendPath);

// servir React
app.use(express.static(frontendPath));

// fallback React
app.get("*", (req, res) => {
  res.sendFile(indexPath);
});

const PORT = process.env.PORT || 8080;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Atlas connected");
    console.log("🔥 PORT utilisé:", PORT);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));