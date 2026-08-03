addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

/**
 * Simple Cloudflare Worker to proxy backend calls to OpenAI.
 * Expects an OPENAI API key to be set as a secret/variable on the worker named OPENAI_API_KEY.
 *
 * Endpoints:
 *  POST /api/generate-questions  -> generate questions JSON
 *  POST /api/evaluate-answer    -> evaluate an answer
 *  POST /api/coach              -> coach response
 *
 * Response bodies are JSON. Minimal error handling included.
 */

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, ''); // remove trailing slash
  try {
    if (request.method === 'POST' && path.endsWith('/api/generate-questions')) {
      return await proxyToOpenAI(request, 'generate-questions');
    }
    if (request.method === 'POST' && path.endsWith('/api/evaluate-answer')) {
      return await proxyToOpenAI(request, 'evaluate-answer');
    }
    if (request.method === 'POST' && path.endsWith('/api/coach')) {
      return await proxyToOpenAI(request, 'coach');
    }
    // default: return 404 for other paths
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: jsonHeaders()
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Worker error' }), {
      status: 500,
      headers: jsonHeaders()
    });
  }
}

function jsonHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*', // update to restrict if you set a domain
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

// Example: basic wrapper that formats prompts and calls OpenAI
async function proxyToOpenAI(request, mode) {
  // Allow preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  const body = await request.json().catch(() => ({}));
  const openaiKey = OPENAI_API_KEY || (typeof __ENV !== 'undefined' ? __ENV.OPENAI_API_KEY : undefined);
  if (!openaiKey) throw new Error('OPENAI_API_KEY not configured on the Worker');

  // Build a simple prompt depending on mode
  let system = 'You are a helpful assistant that outputs valid JSON only.';
  let user = '';
  if (mode === 'generate-questions') {
    const resumeText = (body.resumeText || '').slice(0, 4000);
    user = `Read the following resume content and generate 12 interview questions tailored to the candidate. Output exactly JSON: an array of objects with keys: category, q, options (array of strings optional), elaborative (string). Resume:\n${resumeText}`;
  } else if (mode === 'evaluate-answer') {
    user = `You are an evaluator. Given the question and candidate answer, return JSON with keys: score (1-5), feedback (short). Input: ${JSON.stringify(body)}`;
  } else if (mode === 'coach') {
    const prompt = body.message || 'Give short coaching advice.';
    user = `Act as a concise career coach. Respond with JSON: { reply: string }. Input: ${prompt}`;
  } else {
    user = 'Unknown mode';
  }

  // Call OpenAI Chat Completions
  const openaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      max_tokens: 500,
      temperature: 0.7
    })
  });

  if (!openaiResp.ok) {
    const txt = await openaiResp.text();
    return new Response(JSON.stringify({ error: 'OpenAI error', details: txt }), { status: 502, headers: jsonHeaders() });
  }

  const data = await openaiResp.json().catch(() => null);
  // Return the raw OpenAI content in field `openai` plus a guessed parsed JSON output if possible
  let text = (data?.choices && data.choices[0] && (data.choices[0].message?.content || data.choices[0].text)) || '';
  // Try to parse JSON from the assistant text
  let parsed = null;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    // if not pure JSON, attempt to extract JSON-like substring
    const m = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (m) {
      try { parsed = JSON.parse(m[0]); } catch (e) { parsed = null; }
    }
  }

  return new Response(JSON.stringify({ ok: true, text, parsed, openai: data }), { status: 200, headers: jsonHeaders() });
}
