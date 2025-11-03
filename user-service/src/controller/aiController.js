const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

function violatesPolicy(text = '') {
  const s = String(text).toLowerCase();
  return s.includes('full solution') ||
         s.includes('complete solution') ||
         s.includes('final code') ||
         s.includes('just give code') ||
         s.includes('paste the solution');
}

function buildParts({ system, context, userText }) {
  const parts = [];
  if (system) parts.push({ text: `[SYSTEM]\n${system}` });

  let ctx = '';
  if (context) {
    const { code, codeLanguage, question } = context;
    ctx += `\n\n[EDITOR]\nLanguage: ${codeLanguage || 'unknown'}\nCode:\n${code || '(empty)'}\n`;
    if (question) ctx += `\n[QUESTION]\n${JSON.stringify(question, null, 2)}\n`;
  }
  parts.push({ text: `${userText}\n${ctx}` });
  return parts;
}

exports.assist = async (req, res) => {
  try {
    if (!GEMINI_API_KEY) return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });

    const { model = GEMINI_MODEL, system, messages = [], context } = req.body || {};
    const last = messages[messages.length - 1] || {};
    const userText = last.role === 'user' ? String(last.content || '') : '';

    if (violatesPolicy(userText)) {
      return res.json({
        text: "I can’t provide a complete solution. I can give hints, explain concepts, or translate the current code—what would you like?"
      });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${GEMINI_API_KEY}`;
    const body = {
      contents: [{ role: 'user', parts: buildParts({ system, context, userText }) }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 800 }
    };

    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok) return res.status(r.status).send(await r.text());

    const data = await r.json();
    const text = data?.candidates?.[0]?.content?.parts?.map(p => p?.text || '').join('') || '';
    return res.json({ text });
  } catch (e) {
    return res.status(500).json({ error: e.message || String(e) });
  }
};
