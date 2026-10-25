const REQUEST_INTERVAL_MS = 60 * 1000;
const REQUEST_TIMEOUT_MS = 10 * 1000;
const MAX_TITLE_LENGTH = 200;
const requestsByTask = new Map();

function fallback(res, message) {
    return res.status(200).json({
        description: "",
        fallback: true,
        message
    });
}

const generateDescription = async (req, res) => {
    const { title } = req.body || {};

    if (typeof title !== "string" || !title.trim() || title.trim().length > MAX_TITLE_LENGTH) {
        return res.status(400).json({
            message: `Task title must be between 1 and ${MAX_TITLE_LENGTH} characters`
        });
    }

    const normalizedTitle = title.trim().toLowerCase();
    const requestKey = `${req.ip}:${normalizedTitle}`;
    const now = Date.now();

    for (const [key, timestamp] of requestsByTask) {
        if (now - timestamp >= REQUEST_INTERVAL_MS) {
            requestsByTask.delete(key);
        }
    }

    const lastRequest = requestsByTask.get(requestKey);
    if (lastRequest !== undefined && now - lastRequest < REQUEST_INTERVAL_MS) {
        const retryAfterSeconds = Math.ceil((REQUEST_INTERVAL_MS - (now - lastRequest)) / 1000);
        return res.status(429).json({
            message: `Please wait ${retryAfterSeconds} seconds before generating another description for this task.`,
            retryAfterSeconds
        });
    }

    requestsByTask.set(requestKey, now);

    if (!process.env.GROQ_API_KEY) {
        return fallback(res, "AI is not configured. You can still write and save the task description yourself.");
    }

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-120b",
                messages: [
                    {
                        role: "system",
                        content: "Write a concise, actionable description for a task. Use one or two sentences and do not invent personal or sensitive details."
                    },
                    {
                        role: "user",
                        content: `Task title: ${title.trim()}`
                    }
                ],
                max_tokens: 120
            }),
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
        });

        if (!response.ok) {
            throw new Error(`Groq returned HTTP ${response.status}`);
        }

        const result = await response.json();
        const description = result.choices?.[0]?.message?.content?.trim();
        if (typeof description !== "string" || !description) {
            throw new Error("Groq returned an empty description");
        }

        return res.status(200).json({
            description,
            fallback: false
        });
    } catch (err) {
        console.error("[AI] Description generation failed:", err.message);
        return fallback(res, "AI suggestions are temporarily unavailable. You can still write and save the task description yourself.");
    }
};

module.exports = { generateDescription };
