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