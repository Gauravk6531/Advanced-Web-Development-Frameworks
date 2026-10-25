# Project Code Documentation

This document contains the complete source code for the full project after the backend restructure.

## Project Structure

```text
Practical 5 MongoDB Integration and Schema Design with Mongoose/
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── server.js
│   ├── serviceAccountKey.json
│   └── src/
│       ├── app.js
│       ├── config/
│       │   └── db.js
│       ├── controllers/
│       │   └── taskController.js
│       ├── middleware/
│       │   └── errorHandler.js
│       ├── models/
│       │   └── Task.js
│       └── routes/
│           └── taskRoutes.js
├── frontend/
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── project_structure.txt
│   ├── README.md
│   ├── vite.config.js
│   └── src/
│       ├── App.css
│       ├── App.jsx
│       ├── index.css
│       ├── main.jsx
│       ├── components/
│       │   ├── About.jsx
│       │   ├── Contact.jsx
│       │   ├── ErrorMessage.jsx
│       │   ├── Footer.jsx
│       │   ├── Header.css
│       │   ├── Header.jsx
│       │   ├── Home.jsx
│       │   ├── Navbar.jsx
│       │   ├── NotFound.jsx
│       │   ├── Projects.jsx
│       │   ├── RepoCard.jsx
│       │   ├── Skills.jsx
│       │   └── Spinner.jsx
│       └── pages/
│           ├── Projects.jsx
│           └── Tasks.jsx
└── PROJECT_CODE.md
```

---

## Backend Code

### backend/package.json

```json
{
  "name": "backend",
  "version": "1.0.0",
  "description": "Task manager backend using Express and MongoDB",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "keywords": ["express", "mongodb", "mongoose", "task-manager"],
  "author": "",
  "license": "ISC",
  "type": "commonjs",
  "dependencies": {
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "mongoose": "^9.9.1"
  }
}
```

### backend/server.js

```js
require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

startServer();
```

### backend/src/app.js

```js
const express = require("express");
const taskRoutes = require("./routes/taskRoutes");
const errorHandler = require("./middleware/errorHandler");

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

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Task Manager API" });
});

app.use("/tasks", taskRoutes);
app.use("/api/tasks", taskRoutes);

app.use(errorHandler);

module.exports = app;
```

### backend/src/config/db.js

```js
const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is missing in the .env file.");
  }

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");
};

module.exports = connectDB;
```

### backend/src/models/Task.js

```js
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

taskSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Task", taskSchema);
```

### backend/src/controllers/taskController.js

```js
const Task = require("../models/Task");

const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const title = req.body.title?.trim();

    if (!title) {
      return res.status(400).json({ message: "Task title is required" });
    }

    const newTask = await Task.create({
      title,
      completed: false,
    });

    res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { title, completed } = req.body;

    if (title !== undefined && !title.trim()) {
      return res.status(400).json({ message: "Task title cannot be empty" });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      {
        ...(title !== undefined && { title: title.trim() }),
        ...(completed !== undefined && { completed }),
      },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully", task: deletedTask });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
```

### backend/src/routes/taskRoutes.js

```js
const express = require("express");
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

const router = express.Router();

router.get("/", getTasks);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

module.exports = router;
```

### backend/src/middleware/errorHandler.js

```js
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    message: err.message || "Something went wrong",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
```

### backend/.env.example

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/Practical_5
```

### backend/.env

```env
MONGO_URI=mongodb://localhost:27017/Practical_5
```

---

## Frontend Code

### frontend/package.json

```json
{
  "name": "student-portfolio",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.7",
    "react-dom": "^19.2.7",
    "react-router-dom": "^7.18.1"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.3",
    "eslint": "^10.6.0",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.3",
    "globals": "^17.7.0",
    "vite": "^8.1.1"
  }
}
```

### frontend/vite.config.js

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/tasks': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
```

### frontend/eslint.config.js

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
])
```

### frontend/index.html

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>student-portfolio</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### frontend/src/main.jsx

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

### frontend/src/App.jsx

```jsx
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Projects from "./pages/Projects";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import About from "./components/About";
import Skills from "./components/Skills";
import Contact from "./components/Contact";
import NotFound from "./components/NotFound";
import Footer from "./components/Footer";
import Tasks from "./pages/Tasks";

function App() {
  return (
    <>
      <Header name="Kolhe Gaurav" themeColor="teal" />
      <Navbar />

      <main style={{ padding: "20px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/tasks" element={<Tasks />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer email="gauravkolhe019@google.com" />
    </>
  );
}

export default App;
```

### frontend/src/App.css

```css
header {
  text-align: left;
  padding: 20px;
}

.vertical-line {
  width: 2px;
  height: 100px;
  background-color: black;
}

.page-section {
  text-align: left;
  max-width: 720px;
  margin: 0 auto;
  padding: 12px 0 24px;
}

.page-section ul {
  padding-left: 20px;
}
```

### frontend/src/index.css

```css
:root {
  --text: #6b6375;
  --text-h: #08060d;
  --bg: #fff;
  --border: #e5e4e7;
  --code-bg: #f4f3ec;
  --accent: #aa3bff;
  --accent-bg: rgba(170, 59, 255, 0.1);
  --accent-border: rgba(170, 59, 255, 0.5);
  --social-bg: rgba(244, 243, 236, 0.5);
  --shadow:
    rgba(0, 0, 0, 0.1) 0 10px 15px -3px, rgba(0, 0, 0, 0.05) 0 4px 6px -2px;

  --sans: system-ui, 'Segoe UI', Roboto, sans-serif;
  --heading: system-ui, 'Segoe UI', Roboto, sans-serif;
  --mono: ui-monospace, Consolas, monospace;

  font: 18px/145% var(--sans);
  letter-spacing: 0.18px;
  color-scheme: light dark;
  color: var(--text);
  background: var(--bg);
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  @media (max-width: 1024px) {
    font-size: 16px;
  }
}

@media (prefers-color-scheme: dark) {
  :root {
    --text: #9ca3af;
    --text-h: #f3f4f6;
    --bg: #16171d;
    --border: #2e303a;
    --code-bg: #1f2028;
    --accent: #c084fc;
    --accent-bg: rgba(192, 132, 252, 0.15);
    --accent-border: rgba(192, 132, 252, 0.5);
    --social-bg: rgba(47, 48, 58, 0.5);
    --shadow:
      rgba(0, 0, 0, 0.4) 0 10px 15px -3px, rgba(0, 0, 0, 0.25) 0 4px 6px -2px;
  }

  #social .button-icon {
    filter: invert(1) brightness(2);
  }
}

body {
  margin: 0;
}

#root {
  width: 1126px;
  max-width: 100%;
  margin: 0 auto;
  text-align: center;
  border-inline: 1px solid var(--border);
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

h1,
h2 {
  font-family: var(--heading);
  font-weight: 500;
  color: var(--text-h);
}

h1 {
  font-size: 56px;
  letter-spacing: -1.68px;
  margin: 32px 0;
  @media (max-width: 1024px) {
    font-size: 36px;
    margin: 20px 0;
  }
}
h2 {
  font-size: 24px;
  line-height: 118%;
  letter-spacing: -0.24px;
  margin: 0 0 8px;
  @media (max-width: 1024px) {
    font-size: 20px;
  }
}
p {
  margin: 0;
}

code,
.counter {
  font-family: var(--mono);
  display: inline-flex;
  border-radius: 4px;
  color: var(--text-h);
}

code {
  font-size: 15px;
  line-height: 135%;
  padding: 4px 8px;
  background: var(--code-bg);
}
```

### frontend/src/components/Header.jsx

```jsx
function Header({ name, themeColor }) {
  return (
    <header
      style={{
        backgroundColor: themeColor,
        color: "white",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <h1>{name}</h1>
      <p>AI & Machine Learning Student</p>
    </header>
  );
}

export default Header;
```

### frontend/src/components/Navbar.jsx

```jsx
import { NavLink } from "react-router-dom";

function Navbar() {
  const links = [
    { to: "/", label: "Home" },
    { to: "/projects", label: "Projects" },
    { to: "/contact", label: "Contact" },
    { to: "/tasks", label: "Tasks" }
  ];

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        background: "#333",
        padding: "10px",
      }}
    >
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          style={({ isActive }) => ({
            color: isActive ? "#ffd700" : "white",
            textDecoration: "none",
            fontWeight: "bold",
          })}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default Navbar;
```

### frontend/src/components/Home.jsx

```jsx
import About from "./About";
import Skills from "./Skills";

function Home() {
  const skills = ["React", "JavaScript", "Python", "Machine Learning", "SQL", "Git"];

  return (
    <section className="page-section">
      <About college="CHARUSAT University" />
      <Skills skillList={skills} />
    </section>
  );
}

export default Home;
```

### frontend/src/components/About.jsx

```jsx
function About()
{
    return(
        <section id="about">
            <h2>About Me</h2>

            <p>I am a B.Tech Computer Engineering student interested in
        Artificial Intelligence, Machine Learning, and Web Development.</p>
            <h3>Skills</h3>
            <ul>
                <li>HTML</li>
                <li>CSS</li>
                <li>JavaScript</li>
                <li>React</li>
                <li>Python</li>
            </ul>
            
        </section>
    );
}
export default About;
```

### frontend/src/components/Skills.jsx

```jsx
function Skills({ skillList }) {
  return (
    <section id="skills">
      <h2>Skills</h2>

      <ul>
        {skillList.map((skill) => (
          <li key={skill}>{skill}</li>
        ))}
      </ul>
    </section>
  );
}

export default Skills;
```

### frontend/src/components/Contact.jsx

```jsx
import { useState } from "react";

function Contact() {
  const [message, setMessage] = useState("");
  const [showHint, setShowHint] = useState(true);

  return (
    <section className="page-section">
      <h2>Contact Me</h2>
      <p>Send me a message and I will get back to you soon.</p>

      <label htmlFor="message" style={{ display: "block", marginTop: "16px", fontWeight: "bold" }}>
        Your message
      </label>
      <textarea
        id="message"
        rows="5"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message here..."
        style={{ width: "100%", maxWidth: "480px", marginTop: "8px", padding: "10px" }}
      />

      <p style={{ marginTop: "8px", color: "#666" }}>
        Character count: {message.length}
      </p>

      <button
        type="button"
        onClick={() => setShowHint((prev) => !prev)}
        style={{ marginTop: "12px", padding: "8px 12px" }}
      >
        {showHint ? "Hide tip" : "Show tip"}
      </button>

      {showHint && (
        <p style={{ marginTop: "10px", color: "#007bff" }}>
          Tip: Use a short and clear subject line for better responses.
        </p>
      )}
    </section>
  );
}

export default Contact;
```

### frontend/src/components/Footer.jsx

```jsx
function Footer({ email }) {
  return (
    <footer
      id="footer"
      style={{
        background: "#222",
        color: "white",
        padding: "15px",
        textAlign: "center",
      }}
    >
      <p>Email: {email}</p>

      <p>© 2026 Student Portfolio</p>
    </footer>
  );
}

export default Footer;
```

### frontend/src/components/NotFound.jsx

```jsx
function NotFound() {
  return (
    <section className="page-section">
      <h2>404 - Page Not Found</h2>
      <p>The page you are looking for does not exist.</p>
    </section>
  );
}

export default NotFound;
```

### frontend/src/pages/Projects.jsx

```jsx
import { useState, useEffect } from "react";

function Projects() {
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetch("https://api.github.com/users/Gauravk6531/repos")
            .then((response) => {
                if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
                return response.json();
            })
            .then((data) => setRepos(data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading repos...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <section>
            <h2>Projects</h2>
            <ul>
                {repos.map((repo) => (
                    <li key={repo.id}>
                        <a href={repo.html_url} target="_blank" rel="noreferrer">
                            {repo.name}
                        </a>
                        {repo.description && <p>{repo.description}</p>}
                    </li>
                ))}
            </ul>
        </section>
    );
}

export default Projects;
```

### frontend/src/pages/Tasks.jsx

```jsx
import { useEffect, useState } from "react";

function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTasks = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/tasks");
            if (!response.ok) {
                throw new Error("Failed to load tasks");
            }
            const data = await response.json();
            setTasks(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleAddTask = async (event) => {
        event.preventDefault();
        if (!newTaskTitle.trim()) {
            setError("Task title cannot be empty.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ title: newTaskTitle.trim() })
            });

            if (!response.ok) {
                throw new Error("Unable to add task. Please try again.");
            }

            const createdTask = await response.json();
            setTasks((prevTasks) => [createdTask, ...prevTasks]);
            setNewTaskTitle("");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleTask = async (taskId, currentStatus) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/tasks/${taskId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ completed: !currentStatus })
            });

            if (!response.ok) {
                throw new Error("Unable to update the task.");
            }

            const updatedTask = await response.json();
            setTasks((prevTasks) =>
                prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/tasks/${taskId}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                throw new Error("Unable to delete the task.");
            }

            setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Task Manager</h1>

            <form onSubmit={handleAddTask} style={{ marginBottom: "20px" }}>
                <label htmlFor="taskTitle">Add a new task</label>
                <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                    <input
                        id="taskTitle"
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Enter task title"
                        style={{ flex: 1, padding: "8px" }}
                    />
                    <button type="submit" disabled={loading} style={{ padding: "8px 16px" }}>
                        {loading ? "Saving..." : "Add Task"}
                    </button>
                </div>
            </form>

            {error && (
                <p style={{ color: "red", marginBottom: "16px" }}>{error}</p>
            )}

            {loading && tasks.length === 0 ? (
                <p>Loading tasks...</p>
            ) : tasks.length === 0 ? (
                <p>No tasks available yet.</p>
            ) : (
                tasks.map((task) => (
                    <div
                        key={task.id}
                        style={{
                            border: "1px solid black",
                            marginBottom: "10px",
                            padding: "10px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "12px"
                        }}
                    >
                        <div>
                            <h3 style={{ textDecoration: task.completed ? "line-through" : "none" }}>
                                {task.title}
                            </h3>
                            <p>Status: {task.completed ? "Completed" : "Pending"}</p>
                        </div>

                        <div style={{ display: "flex", gap: "8px" }}>
                            <button
                                type="button"
                                onClick={() => handleToggleTask(task.id, task.completed)}
                            >
                                {task.completed ? "Mark Pending" : "Mark Done"}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDeleteTask(task.id)}
                                style={{ color: "red" }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default Tasks;
```

### frontend/src/components/Header.css

```css
.vertical-line {
    width: 2px;
    height: 100px;
    background-color: black;
    align-items: center;
}
```

### frontend/src/components/ErrorMessage.jsx

```jsx
```

### frontend/src/components/Spinner.jsx

```jsx
```

### frontend/src/components/RepoCard.jsx

```jsx
```

---

## Notes

- The backend was restructured from a single-file server into a modular architecture using `src/config`, `src/models`, `src/controllers`, `src/routes`, and `src/middleware`.
- The frontend continues to access the task API through the Vite proxy at `/tasks`.
- MongoDB must be running locally or configured via the `MONGO_URI` value in the backend `.env` file.
