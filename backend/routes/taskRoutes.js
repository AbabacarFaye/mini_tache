const express = require("express");
const router = express.Router();

const { createTask, getTasks, updateTask } = require("../controllers/taskController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// ✅ créer tâche
router.post("/", auth, role("manager"), createTask);

// ✅ récupérer tâches
router.get("/", auth, getTasks);

// ✅ mettre à jour une tâche
router.patch("/:id", auth, updateTask);

module.exports = router;