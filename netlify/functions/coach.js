const coachSystem = `You are Neeraj's warm, practical AI career coach for W3M. Help with job search, resumes, interviews, workplace challenges, and career transitions. Be concise, specific, and conversational because each reply will be spoken aloud. Do not make up facts.`;

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  if (!process.env.ANTHROPIC_API_KEY) return { statusCode: 503, body: JSON.stringify({ error: 'Coach is not configured yet' }) };
  try {
    const { message, history = [] } = JSON.parse(event.body || '{}');
    if (!message || typeof message !== 'string') return { statusCode: 400, body: JSON.stringify({ error: 'A message is required' }) };
    const messages = history.filter(item => item && ['user', 'coach'].includes(item.role) && typeof item.text === 'string').map(item => ({ role: item.role === 'coach' ? 'assistant' : 'user', content: item.text })).concat({ role: 'user', content: message });
    const response = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6', max_tokens: 350, system: coachSystem, messages }) });
    if (!response.ok) return { statusCode: 502, body: JSON.stringify({ error: 'Coach provider request failed' }) };
    const data = await response.json();
    const reply = data.content?.filter(block => block.type === 'text').map(block => block.text).join('').trim();
    if (!reply) return { statusCode: 502, body: JSON.stringify({ error: 'Coach provider returned no text' }) };
    return { statusCode: 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }, body: JSON.stringify({ reply }) };
  } catch {
    return { statusCode: 500, body: JSON.stringify({ error: 'Coach service failed' }) };
  }
};
