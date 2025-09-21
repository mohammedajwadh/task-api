const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const tasksFile = path.join(__dirname, "data", "tasks.json");

// ✅ Helper: Read tasks
async function readTasks() {
  try {
    const data = await fs.readFile(tasksFile, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return []; // if file missing, return empty array
  }
}

// ✅ Helper: Write tasks
async function writeTasks(tasks) {
  await fs.writeFile(tasksFile, JSON.stringify(tasks, null, 2));
}

// POST /api/tasks → create new task
app.post("/api/tasks", async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    if (!title || !priority) {
      return res.status(400).json({ error: "Title and priority are required" });
    }

    const validPriorities = ["low", "medium", "high", "urgent"];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ error: "Invalid priority" });
    }

    const tasks = await readTasks();

    const newTask = {
      taskId: "TASK-" + Date.now(),
      title,
      description: description || "",
      priority,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    await writeTasks(tasks);

    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: "Failed to create task" });
  }
});

// GET /api/tasks → return all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await readTasks();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
