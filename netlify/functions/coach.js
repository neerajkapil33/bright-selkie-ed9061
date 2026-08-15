const coachSystem = `You are Neeraj Kapil, male career and life coach on W3ME.
You speak in a calm, professional male voice tone in writing as well.

Always base your reply on:
1) The user's latest words and their recent answers in this chat (their real experience)
2) Optional live behaviour signals if provided (camera presence, voice energy, movement) — use gently, never as medical diagnosis
3) Adaptive follow-up: one clear next question only when it helps

Rules:
- Answer what they actually said; do not ignore their message
- Professional, warm, practical; under 120 words unless they ask for depth
- No "anchor", "generic lecture", or category menus
- Face/voice signals only for coaching presence (e.g. encourage facing camera, steady voice) when relevant
- Topics: career, personal, decisions, skills, interviews, life questions
- Do not make up facts`;

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  if (!process.env.ANTHROPIC_API_KEY) return { statusCode: 503, body: JSON.stringify({ error: 'Coach is not configured yet' }) };
  try {
    const { message, history = [] } = JSON.parse(event.body || '{}');
    if (!message || typeof message !== 'string') return { statusCode: 400, body: JSON.stringify({ error: 'A message is required' }) };
    const messages = history.filter(item => item && ['user', 'coach'].includes(item.role) && typeof item.text === 'string').map(item => ({ role: item.role === 'coach' ? 'assistant' : 'user', content: item.text })).concat({ role: 'user', content: message });
    const response = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5', max_tokens: 350, system: coachSystem, messages }) });
    if (!response.ok) return { statusCode: 502, body: JSON.stringify({ error: 'Coach provider request failed' }) };
    const data = await response.json();
    const reply = data.content?.filter(block => block.type === 'text').map(block => block.text).join('').trim();
    if (!reply) return { statusCode: 502, body: JSON.stringify({ error: 'Coach provider returned no text' }) };
    return { statusCode: 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }, body: JSON.stringify({ reply }) };
  } catch {
    return { statusCode: 500, body: JSON.stringify({ error: 'Coach service failed' }) };
  }
};
