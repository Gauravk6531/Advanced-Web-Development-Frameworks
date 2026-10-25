function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({
            message: "Invalid JSON request body"
        });
    }

    if (err.name === "ValidationError") {
        return res.status(400).json({
            message: "Validation failed",
            error: err.message
        });
    }

    console.error(err);

    return res.status(500).json({
        message: "Internal server error"
    });
}

module.exports = errorHandler;