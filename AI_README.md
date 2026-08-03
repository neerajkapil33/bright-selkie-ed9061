# AI Functions for W3M (Netlify Functions)

This directory adds Netlify Functions that integrate with OpenAI to provide:

- netlify/functions/generate-questions.js -> Generates 12 adaptive questions based on resume + profile.
- netlify/functions/evaluate-answer.js -> Evaluates a candidate's spoken/written answer and returns score + feedback.
- netlify/functions/coach.js -> Lightweight coaching reply endpoint used by the in-page coach UI.

Deployment / environment

1. Add your OpenAI API key to Netlify environment variables with the name `OPENAI_API_KEY`.
2. The site build already uses `netlify.toml` which routes `/api/*` to `/.netlify/functions/:splat` — the frontend should POST to `/api/generate-questions` etc.
3. Functions use global `fetch` (Node 18+ which Netlify provides).

Security & cost

- Do not commit your API key to the repo. Keep it in Netlify env vars.
- Monitor token usage and add rate-limiting or caching as needed.

Notes

- The functions attempt to parse JSON strictly. If the model returns non-JSON or malformed content the function will return 500 with raw model output for debugging.
- If you prefer a different model or additional safeguards (input size limits), update the function files accordingly.
