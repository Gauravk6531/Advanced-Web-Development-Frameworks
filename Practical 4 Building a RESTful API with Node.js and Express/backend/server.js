const express = require("express");

const app = express();
app.use(express.json());

// Allow the frontend to call this API from a different origin
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
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

let tasks = [
    {
        id: 1,
        title: "Learn Express",
        completed: false
    },
    {
        id: 2,
        title: "Complete React Practical",
        completed: true
    }
];

const PORT = process.env.PORT || 5000;

app.get("/tasks", (req, res) => {
    res.json(tasks);
});

app.get("/", (req, res) => {
    res.send("Welcome to Task Manager API");
});

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

server.on("error", (err) => {
    console.error("Server failed to start:", err);
    process.exit(1);
});

app.post("/tasks", (req, res) => {

    const newTask = {
        id: tasks.length + 1,
        title: req.body.title,
        completed: false
    };

    tasks.push(newTask);

    res.status(201).json(newTask);

});