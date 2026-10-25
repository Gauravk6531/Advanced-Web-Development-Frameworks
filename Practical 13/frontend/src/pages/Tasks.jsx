import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";

function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [newTaskAssignedUser, setNewTaskAssignedUser] = useState("");
    const [generatingDescription, setGeneratingDescription] = useState(false);
    const [aiMessage, setAiMessage] = useState("");
    const aiRequestId = useRef(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("all"); // 'all', 'completed', 'pending'

    useEffect(() => {
        const controller = new AbortController();

        fetch("/api/tasks", { signal: controller.signal })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to load tasks");
                }
                return response.json();
            })
            .then((data) => setTasks(data))
            .catch((err) => {
                if (err.name === "AbortError") return;

                setError(err.message);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: err.message
                });
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            });

        return () => controller.abort();
    }, []);

    const handleGenerateDescription = async () => {
        if (!newTaskTitle.trim()) {
            setAiMessage("Enter a task title before requesting a description.");
            return;
        }

        const requestId = ++aiRequestId.current;
        setGeneratingDescription(true);
        setAiMessage("");

        try {
            const response = await fetch("/api/ai/generate-description", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ title: newTaskTitle.trim() })
            });
            const result = await response.json();
            if (requestId !== aiRequestId.current) return;

            if (response.status === 429) {
                setAiMessage(result.message || "Please wait before trying again.");
                return;
            }
            if (!response.ok) {
                throw new Error(result.message || "Unable to generate a description.");
            }

            if (result.description) {
                setNewTaskDescription(result.description);
            }
            setAiMessage(result.message || "AI suggestion added. Review or edit it before saving.");
        } catch (err) {
            if (requestId !== aiRequestId.current) return;
            setAiMessage(err.message || "AI suggestions are unavailable. You can still write a description.");
        } finally {
            if (requestId === aiRequestId.current) {
                setGeneratingDescription(false);
            }
        }
    };

    const handleAddTask = async (event) => {
        event.preventDefault();
        if (!newTaskTitle.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Validation Error",
                text: "Task title cannot be empty."
            });
            return;
        }

        aiRequestId.current += 1;
        setGeneratingDescription(false);
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: newTaskTitle.trim(),
                    description: newTaskDescription.trim(),
                    assignedUser: newTaskAssignedUser.trim()
                })
            });

            if (!response.ok) {
                throw new Error("Unable to add task. Please try again.");
            }

            const createdTask = await response.json();
            setTasks((prevTasks) => [createdTask, ...prevTasks]);
            setNewTaskTitle("");
            setNewTaskDescription("");
            setNewTaskAssignedUser("");
            setAiMessage("");

            Swal.fire({
                icon: "success",
                title: "Task Created",
                text: "Your task has been added successfully!",
                timer: 1500,
                showConfirmButton: false
            });
        } catch (err) {
            setError(err.message);
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: err.message
            });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleTask = async (taskId, currentStatus) => {
        // Edge case: completed task cannot be marked as pending
        if (currentStatus === true) {
            Swal.fire({
                icon: "error",
                title: "Action Denied",
                text: "A completed task cannot be marked as pending."
            });
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/tasks/${taskId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ completed: !currentStatus })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || "Unable to update the task.");
            }

            const updatedTask = await response.json();
            setTasks((prevTasks) =>
                prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
            );

            Swal.fire({
                icon: "success",
                title: "Task Completed",
                text: "Task successfully marked as completed!",
                timer: 1500,
                showConfirmButton: false
            });
        } catch (err) {
            setError(err.message);
            Swal.fire({
                icon: "error",
                title: "Error updating task",
                text: err.message
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTask = async (taskId) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/tasks/${taskId}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                throw new Error("Unable to delete the task.");
            }

            setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));

            Swal.fire({
                icon: "success",
                title: "Deleted!",
                text: "Your task has been deleted.",
                timer: 1500,
                showConfirmButton: false
            });
        } catch (err) {
            setError(err.message);
            Swal.fire({
                icon: "error",
                title: "Error deleting task",
                text: err.message
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredTasks = tasks.filter((task) => {
        if (filter === "completed") return task.completed;
        if (filter === "pending") return !task.completed;
        return true;
    });

    return (
        <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
            <h1>Task Manager</h1>

            <form onSubmit={handleAddTask} style={{ marginBottom: "20px" }}>
                <label htmlFor="taskTitle">Add a new task</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "8px" }}>
                    <input
                        id="taskTitle"
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => {
                            aiRequestId.current += 1;
                            setGeneratingDescription(false);
                            setNewTaskTitle(e.target.value);
                        }}
                        placeholder="Enter task title"
                        style={{ flex: "1 1 180px", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                    />
                    <textarea
                        id="taskDescription"
                        value={newTaskDescription}
                        onChange={(e) => setNewTaskDescription(e.target.value)}
                        placeholder="Task description (optional)"
                        aria-label="Task description (optional)"
                        rows={3}
                        style={{ flex: "1 1 100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", font: "inherit" }}
                    />
                    <button
                        type="button"
                        onClick={handleGenerateDescription}
                        disabled={generatingDescription || !newTaskTitle.trim()}
                        style={{ padding: "8px 16px", borderRadius: "4px", cursor: generatingDescription ? "wait" : "pointer" }}
                    >
                        {generatingDescription ? "Generating..." : "Generate description"}
                    </button>
                    <input
                        id="taskAssignedUser"
                        type="text"
                        value={newTaskAssignedUser}
                        onChange={(e) => setNewTaskAssignedUser(e.target.value)}
                        placeholder="Assigned user (optional)"
                        aria-label="Assigned user (optional)"
                        style={{ flex: "1 1 150px", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                    />
                    <button type="submit" disabled={loading} style={{ padding: "8px 16px", borderRadius: "4px", cursor: "pointer" }}>
                        {loading ? "Saving..." : "Add Task"}
                    </button>
                </div>
                <p role="note" style={{ marginTop: "8px", fontSize: "0.85em", color: "#666" }}>
                    AI-generated suggestions may be inaccurate. Review and edit before saving. Only the task title is sent to the AI service; do not include private or sensitive information.
                </p>
                {aiMessage && (
                    <p role="status" aria-live="polite" style={{ marginTop: "8px", color: "#665000", fontSize: "0.9em" }}>
                        {aiMessage}
                    </p>
                )}
            </form>

            <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
                <button
                    onClick={() => setFilter("all")}
                    style={{
                        padding: "6px 12px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        border: "1px solid #ccc",
                        backgroundColor: filter === "all" ? "#007bff" : "#fff",
                        color: filter === "all" ? "#fff" : "#000"
                    }}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter("completed")}
                    style={{
                        padding: "6px 12px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        border: "1px solid #ccc",
                        backgroundColor: filter === "completed" ? "#28a745" : "#fff",
                        color: filter === "completed" ? "#fff" : "#000"
                    }}
                >
                    Completed
                </button>
                <button
                    onClick={() => setFilter("pending")}
                    style={{
                        padding: "6px 12px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        border: "1px solid #ccc",
                        backgroundColor: filter === "pending" ? "#ffc107" : "#fff",
                        color: filter === "pending" ? "#fff" : "#000"
                    }}
                >
                    Pending
                </button>
            </div>

            {error && (
                <p style={{ color: "red", marginBottom: "16px" }}>{error}</p>
            )}

            {loading && filteredTasks.length === 0 ? (
                <p>Loading tasks...</p>
            ) : filteredTasks.length === 0 ? (
                <p>No tasks available under this filter.</p>
            ) : (
                filteredTasks.map((task) => (
                    <div
                        key={task.id}
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: "6px",
                            marginBottom: "10px",
                            padding: "12px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "12px",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                        }}
                    >
                        <div>
                            <h3 style={{ textDecoration: task.completed ? "line-through" : "none", margin: "0 0 4px 0" }}>
                                {task.title}
                            </h3>
                            {task.description && (
                                <p style={{ margin: "0 0 4px 0", fontSize: "0.9em", color: "#666" }}>
                                    {task.description}
                                </p>
                            )}
                            <p style={{ margin: 0, fontSize: "0.9em", color: "#666" }}>
                                Status: <span style={{ fontWeight: "bold", color: task.completed ? "#28a745" : "#ffc107" }}>{task.completed ? "Completed" : "Pending"}</span>
                            </p>
                            <p style={{ margin: 0, fontSize: "0.9em", color: "#666" }}>
                                Assigned to: {task.assignedUser || "Unassigned"}
                            </p>
                        </div>

                        <div style={{ display: "flex", gap: "8px" }}>
                            {!task.completed && (
                                <button
                                    type="button"
                                    onClick={() => handleToggleTask(task.id, task.completed)}
                                    style={{
                                        padding: "6px 12px",
                                        borderRadius: "4px",
                                        border: "1px solid #28a745",
                                        backgroundColor: "#28a745",
                                        color: "#fff",
                                        cursor: "pointer"
                                    }}
                                >
                                    Mark Done
                                </button>
                            )}
                            {task.completed && (
                                <button
                                    type="button"
                                    onClick={() => handleToggleTask(task.id, task.completed)}
                                    style={{
                                        padding: "6px 12px",
                                        borderRadius: "4px",
                                        border: "1px solid #ccc",
                                        backgroundColor: "#e0e0e0",
                                        color: "#888",
                                        cursor: "not-allowed"
                                    }}
                                    disabled
                                >
                                    Completed
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => handleDeleteTask(task.id)}
                                style={{
                                    padding: "6px 12px",
                                    borderRadius: "4px",
                                    border: "1px solid #dc3545",
                                    backgroundColor: "#dc3545",
                                    color: "#fff",
                                    cursor: "pointer"
                                }}
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