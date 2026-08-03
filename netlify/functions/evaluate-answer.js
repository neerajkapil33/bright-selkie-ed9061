// netlify/functions/evaluate-answer.js
// Netlify Function to evaluate a user's answer transcript and return a score and feedback using OpenAI

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

module.exports.handler = async function(event, context) {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    const body = event.body ? JSON.parse(event.body) : {};
    const { question = {}, transcript = '', resumeText = '', profile = {} } = body;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return { statusCode: 500, body: JSON.stringify({ error: 'Missing OPENAI_API_KEY in function env' }) };
    if (!question || !transcript) return { statusCode: 400, body: JSON.stringify({ error: 'question and transcript required' }) };

    const prompt = `You are an evaluator. Score the candidate answer on a 1..4 scale (4 best).\nContext:\nQuestion: ${question.q}\nResume excerpt: ${(resumeText||'').slice(0,1200)}\nProfile: ${JSON.stringify(profile)}\n\nAnswer transcript: ${transcript}\n\nReturn strict JSON:\n{ "score": <1-4>, "feedback": "<short feedback>", "suggestion": "<one actionable improvement>" }`;

    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a concise JSON evaluator.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 500
    };

    const resp = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return { statusCode: 502, body: JSON.stringify({ error: 'LLM provider error', status: resp.status, detail: txt }) };
    }

    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content ?? data.choices?.[0]?.text ?? null;
    if (!content) return { statusCode: 500, body: JSON.stringify({ error: 'Empty model response', raw: data }) };

    let parsed = null;
    try { parsed = JSON.parse(content); } catch (err) {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) { try { parsed = JSON.parse(match[0]); } catch(e){ parsed = null; } }
    }

    if (!parsed || typeof parsed.score !== 'number') {
      return { statusCode: 500, body: JSON.stringify({ error: 'Invalid evaluation output', raw: content }) };
    }

    return { statusCode: 200, body: JSON.stringify(parsed) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};
