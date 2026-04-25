const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // 🔥 toujours en haut
const authRoutes = require("./routes/authRoutes");
const path = require("path");

const app = express();
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");


// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
// Route test
app.get("/", (req, res) => {
  res.send("API is running...");
});



//app.use(express.static(path.join(__dirname, "public")));

//app.get("*", (req, res) => {
 // res.sendFile(path.join(__dirname, "public", "index.html"));
//});

app.use(express.static(path.join(__dirname, "frontend/build")));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "frontend/build", "index.html"));
});

const PORT = process.env.PORT || 5000;
// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Atlas connecté 🚀");


    // 🔥 lancer le serveur seulement après connexion DB
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.log(err));