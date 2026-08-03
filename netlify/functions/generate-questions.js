// netlify/functions/generate-questions.js
// Netlify Function to generate 12 adaptive assessment questions using OpenAI
// Expects OPENAI_API_KEY in environment variables.

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

module.exports.handler = async function(event, context) {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    const body = event.body ? JSON.parse(event.body) : {};
    const { resumeText = '', stage = 'experienced', industry = '', function: func = '', skill = '', role = '', educationLevel = '' } = body;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return { statusCode: 500, body: JSON.stringify({ error: 'Missing OPENAI_API_KEY in function env' }) };

    // Truncate resume to safe length
    const resumeSnippet = (resumeText || '').slice(0, 3800).replace(/\s+/g, ' ');

    const prompt = `You must respond with STRICT JSON only (no surrounding commentary).\nProduce exactly 12 question objects inside a top-level \"questions\" array.\n\nContext:\n- Candidate stage: ${stage}\n- Industry: ${industry}\n- Function: ${func}\n- Skill focus: ${skill}\n- Target role: ${role}\n- Education level: ${educationLevel}\n- Resume excerpt (up to 3800 chars): """${resumeSnippet}"""\n\nReturn exactly 12 items across these categories:\n1-3: Resume screening & ATS improvement (how to reach 90%+)\n4-6: Interview shortlist questions (3)\n7-8: Burnout / workplace challenges (2)\n9-10: Skill & upskilling (2)\n11: Jobs / location / job portals matching (1)\n12: Coach opt & next steps (1)\n\nFor each item return this JSON object:\n{\n  \"id\": \"<1..12>\",\n  \"category\": \"<Resume|Interview|Workplace|Skills|Jobs|Coach>\",\n  \"q\": \"<full question text>\",\n  \"simplified\": \"<short simplified phrasing>\",\n  \"options\": [ {\"text\":\"<option text>\", \"score\": <1-4>}, {\"text\":\"<option text>\", \"score\": <1-4>} ],\n  \"elaborative\": \"<1-2 sentence prompt asking for a longer answer or example>\"\n}\n\nConstraints:\n- Tailor wording by the 'stage' provided (intern vs experienced).\n- Provide 2 options per question: one high-scoring (score 4) and one lower-scoring (score 1-2).\n- Use English only and valid JSON. The final response must be a single JSON object with \"questions\": [ ...12 objects... ].\n`;

    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a precise JSON generator producing structured assessment questions.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 1200
    };

    const resp = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return { statusCode: 502, body: JSON.stringify({ error: 'LLM provider error', status: resp.status, detail: txt }) };
    }

    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content ?? data.choices?.[0]?.text ?? null;
    if (!content) return { statusCode: 500, body: JSON.stringify({ error: 'Empty model response', raw: data }) };

    // Try to parse JSON directly; if model wrapped JSON, extract first object
    let parsed = null;
    try { parsed = JSON.parse(content); } catch (err) {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        try { parsed = JSON.parse(match[0]); } catch (e) { parsed = null; }
      }
    }

    if (!parsed || !Array.isArray(parsed.questions) || parsed.questions.length !== 12) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Model output not valid or incomplete', raw: content }) };
    }

    return { statusCode: 200, body: JSON.stringify(parsed) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};
