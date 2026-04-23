const express = require("express");
const router = express.Router();

const { getEmployees, addEmployeeByEmail } = require("../controllers/userController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.get("/employees", auth, getEmployees);
router.post("/employees", auth, role("manager"), addEmployeeByEmail);

module.exports = router;