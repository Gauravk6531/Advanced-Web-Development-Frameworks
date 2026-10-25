# Practical 13: AI Task Description Suggestions

The task manager can request a short task description from Groq using the
backend route `POST /api/ai/generate-description`. The browser sends only the
task title to the application backend; the backend keeps the API key and calls
Groq's OpenAI-compatible chat completions endpoint with the
`openai/gpt-oss-120b` model. Generated text is placed in an editable field, and is saved only when
the user submits the task.

## Run locally

1. Copy `backend/.env.example` to `backend/.env`.
2. Set `GROQ_API_KEY` in `backend/.env`. Never put the key in frontend files,
   expose it to browser code, or commit the `.env` file.
3. Start MongoDB, then start the backend from `backend` with `npm run dev`.
4. Start the frontend from `frontend` with `npm run dev`.

The AI integration uses Node's built-in `fetch`, so no additional SDK
dependency is required. The Groq model and endpoint are configured in the
backend.

## Failure handling and usage limit

An unset API key, a Groq error, or a request timeout returns an explanatory
fallback response. The task form remains usable, so descriptions can still be
entered and saved manually. A task title can request one AI suggestion per
minute per client. This in-memory limit resets when the backend restarts and is
intended for this single-instance practical; a multi-instance deployment should
use a shared rate-limit store.

## Responsible AI and privacy

The key stays on the server to prevent disclosure and unauthorized use from
browser code. Only the task title is sent to Groq; do not include passwords,
tokens, personal identifiers, confidential business information, or other
sensitive data in titles. Third-party processing may be subject to that
provider's retention and governance policies. AI output can be inaccurate or
inappropriate, so the user must review and edit it rather than treating it as
authoritative. The task application remains usable when the external service
is unavailable.

Run backend checks with `npm test` in `backend`; run frontend checks with
`npm run lint` and `npm run build` in `frontend`.
