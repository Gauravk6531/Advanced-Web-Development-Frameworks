const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Content-Type"
    );
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },
        completed: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

taskSchema.set("toJSON", {
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

const Task = mongoose.model("Task", taskSchema);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("MONGO_URI is missing in the .env file.");
    process.exit(1);
}

app.get("/", (req, res) => {
    res.send("Welcome to Task Manager API");
});

app.get("/tasks", async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch tasks",
            error: error.message
        });
    }
});

app.post("/tasks", async (req, res) => {
    try {
        const title = req.body.title?.trim();

        if (!title) {
            return res.status(400).json({ message: "Task title is required" });
        }

        const newTask = await Task.create({
            title,
            completed: false
        });

        res.status(201).json(newTask);
    } catch (error) {
        res.status(400).json({
            message: "Unable to create task",
            error: error.message
        });
    }
});

app.put("/tasks/:id", async (req, res) => {
    try {
        const { title, completed } = req.body;

        const existingTask = await Task.findById(req.params.id);
        if (!existingTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Edgecase check: completed task cannot be marked as pending
        if (existingTask.completed && completed === false) {
            return res.status(400).json({ message: "A completed task cannot be marked as pending" });
        }

        if (title !== undefined) {
            existingTask.title = title.trim();
        }
        if (completed !== undefined) {
            existingTask.completed = completed;
        }

        const updatedTask = await existingTask.save();
        res.json(updatedTask);
    } catch (error) {
        res.status(400).json({
            message: "Unable to update task",
            error: error.message
        });
    }
});

app.delete("/tasks/:id", async (req, res) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);

        if (!deletedTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json({ message: "Task deleted successfully", task: deletedTask });
    } catch (error) {
        res.status(400).json({
            message: "Unable to delete task",
            error: error.message
        });
    }
});

async function startServer() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
}

startServer();