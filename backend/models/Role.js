const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ["manager", "employee"],
    required: true,
  },
});

module.exports = mongoose.model("Role", roleSchema);