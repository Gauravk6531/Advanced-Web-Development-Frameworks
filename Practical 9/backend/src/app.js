const express = require("express");
const cors = require("cors");

const taskRoutes = require("./routes/task.routes");
const errorHandler = require("./middleware/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({
        message: "welcome to task manager API"
    });
});

app.use("/api/tasks", taskRoutes);
app.use(errorHandler);

module.exports = app;
