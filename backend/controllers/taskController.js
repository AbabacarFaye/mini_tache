const Task = require("../models/Task");



exports.createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, deadline } = req.body;

    // 🔥 validation
    if (!title || !assignedTo) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      deadline,
      createdBy: req.user.id,
      history: [
        {
          status: "pending",
          note: "",
          changedBy: req.user.id,
        },
      ],
    });

    res.json(task);

  } catch (err) {
    console.log(err); // 🔥 IMPORTANT
    res.status(500).json({ error: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const isAssignedEmployee = String(task.assignedTo) === String(req.user.id);
    const isManager = req.user.role === "manager";

    if (!isAssignedEmployee && !isManager) {
      return res.status(403).json({ message: "Access denied" });
    }

    const nextStatus = status || task.status;
    const nextNote = typeof note === "string" ? note : task.note;

    if (status) {
      if (!["pending", "in-progress", "completed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      task.status = status;
    }

    if (typeof note === "string") {
      task.note = note;
    }

    task.history = task.history || [];
    task.history.push({
      status: nextStatus,
      note: nextNote,
      changedBy: req.user.id,
    });

    await task.save();

    return res.json(task);
  } catch (err) {
    console.error("updateTask error:", err);
    return res.status(500).json({ message: err.message });
  }
};

exports.getTasks = async (req, res) => {
  let tasks;

  if (req.user.role === "manager") {
    tasks = await Task.find()
      .populate("assignedTo")
      .populate("history.changedBy", "name email");
  } else {
    tasks = await Task.find({ assignedTo: req.user.id })
      .populate("assignedTo")
      .populate("history.changedBy", "name email");
  }

  res.json(tasks);
};