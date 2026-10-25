const path = require("path");

require("dotenv").config({
    path: path.resolve(__dirname, "../.env")
});

require("./listeners");

const app = require("./app");
const connectDB = require("./config/database");

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error("Failed to start server:", err.message);
        process.exitCode = 1;
    }
}

startServer();
