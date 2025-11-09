const AI_BASE = process.env.REACT_APP_AI_URL || "http://localhost:5055";

export async function aiChat(payload) {
  const r = await fetch(`${AI_BASE}/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include"
  });
  if (!r.ok) throw new Error(`AI chat failed: ${r.status}`);
  return await r.json(); // { ok, message, error }
}

export async function aiTranslate(payload) {
  const r = await fetch(`${AI_BASE}/ai/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include"
  });
  if (!r.ok) throw new Error(`AI translate failed: ${r.status}`);
  return await r.json(); // { ok, message, error }
}
