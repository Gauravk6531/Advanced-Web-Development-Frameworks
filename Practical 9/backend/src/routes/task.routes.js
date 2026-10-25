const express = require("express");

const {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    getTaskCacheStats
} = require("../controller/tasks.controller");

const router = express.Router();

router.get("/debug/cache", getTaskCacheStats);
router.get("/", getTasks);
router.get("/:id", getTask);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

module.exports = router;