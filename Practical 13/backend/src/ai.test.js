const request = require("supertest");
const app = require("./app");

describe("AI description endpoint", () => {
    const originalApiKey = process.env.GROQ_API_KEY;
    const originalFetch = global.fetch;
    const originalConsoleError = console.error;

    afterEach(() => {
        if (originalApiKey === undefined) {
            delete process.env.GROQ_API_KEY;
        } else {
            process.env.GROQ_API_KEY = originalApiKey;
        }
        global.fetch = originalFetch;
        console.error = originalConsoleError;
    });

    test("returns an editable fallback when no API key is configured", async () => {
        delete process.env.GROQ_API_KEY;

        const response = await request(app)
            .post("/api/ai/generate-description")
            .send({ title: "Write project notes without configured AI" });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            description: "",
            fallback: true
        });
        expect(response.body.message).toContain("still write");
    });

    test("rejects a missing task title", async () => {
        const response = await request(app)
            .post("/api/ai/generate-description")
            .send({ title: " " });

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/Task title/);
    });

    test("generates a description without returning the API key", async () => {
        process.env.GROQ_API_KEY = "test-secret-key";
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                choices: [{ message: { content: "Prepare an agenda and share it with the team." } }]
            })
        });

        const response = await request(app)
            .post("/api/ai/generate-description")
            .send({ title: "Prepare a team meeting agenda" });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            description: "Prepare an agenda and share it with the team.",
            fallback: false
        });
        expect(JSON.stringify(response.body)).not.toContain("test-secret-key");
        expect(global.fetch).toHaveBeenCalledWith(
            "https://api.groq.com/openai/v1/chat/completions",
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: "Bearer test-secret-key"
                })
            })
        );
        expect(JSON.parse(global.fetch.mock.calls[0][1].body).model).toBe("openai/gpt-oss-120b");
    });

    test("returns a fallback and rate-limits repeated requests for the same task", async () => {
        delete process.env.GROQ_API_KEY;
        const title = "Draft quarterly handoff notes";
        const firstResponse = await request(app)
            .post("/api/ai/generate-description")
            .send({ title });
        const secondResponse = await request(app)
            .post("/api/ai/generate-description")
            .send({ title });

        expect(firstResponse.status).toBe(200);
        expect(firstResponse.body.fallback).toBe(true);
        expect(secondResponse.status).toBe(429);
        expect(secondResponse.body.retryAfterSeconds).toBeGreaterThan(0);
    });

    test("falls back when the AI provider fails", async () => {
        process.env.GROQ_API_KEY = "test-secret-key";
        global.fetch = jest.fn().mockRejectedValue(new Error("provider unavailable"));
        console.error = jest.fn();

        const response = await request(app)
            .post("/api/ai/generate-description")
            .send({ title: "Create a project handoff checklist" });

        expect(response.status).toBe(200);
        expect(response.body.fallback).toBe(true);
        expect(response.body.message).toContain("temporarily unavailable");
    });
});
