const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(express.json());

// ===== CORS Middleware =====
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
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

// ===== Database Schemas =====

// User Schema
const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

userSchema.set("toJSON", {
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.password;
        delete ret.__v;
        return ret;
    }
});

const User = mongoose.model("User", userSchema);

// Task Schema
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
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
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

// ===== Authentication Middleware =====
const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "No token provided. Authorization denied." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired. Please login again." });
        }
        res.status(401).json({ message: "Invalid token. Authorization denied." });
    }
};

// ===== Validation Middleware =====
const validateTaskInput = (req, res, next) => {
    const { title } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
        return res.status(400).json({ message: "Task title is required and must be a non-empty string" });
    }

    next();
};

const validateAuthInput = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || typeof email !== "string" || !email.trim()) {
        return res.status(400).json({ message: "Email is required and must be a valid string" });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
        return res.status(400).json({ message: "Password is required and must be at least 6 characters long" });
    }

    next();
};

// ===== Configuration =====
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGO_URI) {
    console.error("MONGO_URI is missing in the .env file.");
    process.exit(1);
}

if (!JWT_SECRET) {
    console.error("JWT_SECRET is missing in the .env file.");
    process.exit(1);
}

// ===== API Routes =====

// Welcome Endpoint
app.get("/", (req, res) => {
    res.send("Welcome to Task Manager API with Authentication");
});

// ===== Authentication Routes =====

// Register Route
app.post("/register", validateAuthInput, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ message: "Email already registered" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = await User.create({
            email: email.toLowerCase(),
            password: hashedPassword
        });

        res.status(201).json({
            message: "User registered successfully",
            user: user
        });
    } catch (error) {
        res.status(400).json({
            message: "Registration failed",
            error: error.message
        });
    }
});

// Login Route
app.post("/login", validateAuthInput, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            message: "Login successful",
            token,
            user: user
        });
    } catch (error) {
        res.status(400).json({
            message: "Login failed",
            error: error.message
        });
    }
});

// Get Current User Profile (Supplementary - /me endpoint)
app.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(400).json({
            message: "Failed to fetch user profile",
            error: error.message
        });
    }
});

// ===== Protected Task Routes (All require authentication) =====

// Get all tasks for logged-in user
app.get("/tasks", authMiddleware, async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch tasks",
            error: error.message
        });
    }
});

// Create a new task
app.post("/tasks", authMiddleware, validateTaskInput, async (req, res) => {
    try {
        const title = req.body.title.trim();

        const newTask = await Task.create({
            title,
            completed: false,
            userId: req.user.id
        });

        res.status(201).json(newTask);
    } catch (error) {
        res.status(400).json({
            message: "Unable to create task",
            error: error.message
        });
    }
});

// Update a task
app.put("/tasks/:id", authMiddleware, async (req, res) => {
    try {
        const { title, completed } = req.body;

        // Find task and verify it belongs to the user
        const existingTask = await Task.findById(req.params.id);
        if (!existingTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Check if task belongs to the authenticated user
        if (existingTask.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized: You can only modify your own tasks" });
        }

        // Edgecase check: completed task cannot be marked as pending
        if (existingTask.completed && completed === false) {
            return res.status(400).json({ message: "A completed task cannot be marked as pending" });
        }

        if (title !== undefined) {
            const trimmedTitle = title.trim();
            if (!trimmedTitle) {
                return res.status(400).json({ message: "Task title cannot be empty" });
            }
            existingTask.title = trimmedTitle;
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

// Delete a task
app.delete("/tasks/:id", authMiddleware, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Check if task belongs to the authenticated user
        if (task.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized: You can only delete your own tasks" });
        }

        const deletedTask = await Task.findByIdAndDelete(req.params.id);
        res.json({ message: "Task deleted successfully", task: deletedTask });
    } catch (error) {
        res.status(400).json({
            message: "Unable to delete task",
            error: error.message
        });
    }
});

// ===== Server Initialization =====
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
