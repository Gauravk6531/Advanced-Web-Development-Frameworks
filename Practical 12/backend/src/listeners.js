const taskEvents = require("./events");

taskEvents.on("task-created", (task) => {
    setImmediate(async () => {
        try {
            console.log(`[Notification] Handler started at ${new Date().toISOString()}`);
            await new Promise((resolve) => setTimeout(resolve, 2000));
            console.log(
                `[Notification] Task "${task.title}" created at ${new Date().toISOString()}; ` +
                `assigned user: ${task.assignedUser || "Unassigned"}`
            );
        } catch (error) {
            taskEvents.emit("error", error);
        }
    });
});

taskEvents.on("task-deleted", (task) => {
    console.log(
        `[Notification] Task "${task.title}" deleted at ${new Date().toISOString()}`
    );
});

taskEvents.on("error", (error) => {
    console.error("[Task notification error]", error);
});
