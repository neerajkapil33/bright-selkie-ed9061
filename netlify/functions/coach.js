// netlify/functions/coach.js
// Lightweight coach function: accepts message + history and returns a coach reply using OpenAI

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

module.exports.handler = async function(event, context) {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    const body = event.body ? JSON.parse(event.body) : {};
    const { message = '', history = [] } = body;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return { statusCode: 500, body: JSON.stringify({ error: 'Missing OPENAI_API_KEY in function env' }) };
    if (!message) return { statusCode: 400, body: JSON.stringify({ error: 'message required' }) };

    const system = `You are Neeraj, a concise and actionable career coach. Answer with one short paragraph (2-4 sentences) and one bullet action item the candidate can take next. Keep tone encouraging and practical.`;

    const convo = [{ role: 'system', content: system }];
    // Add a small history context if provided
    history.slice(-6).forEach(h => {
      convo.push({ role: h.role === 'user' ? 'user' : 'assistant', content: h.text });
    });
    convo.push({ role: 'user', content: message });

    const payload = { model: 'gpt-4o-mini', messages: convo, temperature: 0.3, max_tokens: 300 };

    const resp = await fetch(OPENAI_URL, { method: 'POST', headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${apiKey}` }, body: JSON.stringify(payload) });
    if (!resp.ok) { const txt = await resp.text(); return { statusCode: 502, body: JSON.stringify({ error:'LLM provider error', status: resp.status, detail: txt }) }; }
    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content ?? data.choices?.[0]?.text ?? '';

    // Return small reply object
    return { statusCode: 200, body: JSON.stringify({ reply: (content || '').trim() }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};
