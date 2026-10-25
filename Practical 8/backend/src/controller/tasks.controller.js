const mongoose = require("mongoose");
const Task = require("../models/task");
const asyncHandler = require("../utils/asynchandler");

// GET /tasks
const getTasks = asyncHandler(async (req, res) => {
    const tasks = await Task.find().sort({ createdAt: -1 });

    res.status(200).json(tasks);
});

// POST /tasks
const createTask = asyncHandler(async (req, res) => {
    const { title } = req.body;

    if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
            message: "Task title is required"
        });
    }

    const newTask = await Task.create({
        title: title.trim(),
        completed: false
    });

    res.status(201).json(newTask);
});

// PUT /tasks/:id
const updateTask = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, completed } = req.body;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            message: "Invalid task ID"
        });
    }

    if (title === undefined && completed === undefined) {
        return res.status(400).json({
            message: "Provide a title or completed value to update"
        });
    }

    if (
        title !== undefined &&
        (typeof title !== "string" || !title.trim())
    ) {
        return res.status(400).json({
            message: "Title must be a non-empty string"
        });
    }

    if (
        completed !== undefined &&
        typeof completed !== "boolean"
    ) {
        return res.status(400).json({
            message: "Completed must be a boolean"
        });
    }

    const existingTask = await Task.findById(id);

    if (!existingTask) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    if (existingTask.completed && completed === false) {
        return res.status(400).json({
            message: "A completed task cannot be marked as pending"
        });
    }

    if (title !== undefined) {
        existingTask.title = title.trim();
    }

    if (completed !== undefined) {
        existingTask.completed = completed;
    }

    const updatedTask = await existingTask.save();

    res.status(200).json(updatedTask);
});

// DELETE /tasks/:id
const deleteTask = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            message: "Invalid task ID"
        });
    }

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    res.status(200).json({
        message: "Task deleted successfully",
        task: deletedTask
    });
});

module.exports = {
    getTasks,
    createTask,
    updateTask,
    deleteTask
};