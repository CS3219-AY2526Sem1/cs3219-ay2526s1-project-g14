import { Router } from "express";

const router = Router();

async function getGenAI() {
  const mod = await import("@google/generative-ai");
  return mod.GoogleGenerativeAI;
}

// Build prompt exactly as before
function buildPrompt({ mode, questionTitle, questionText, topic, difficulty, code, language, userMessage }) {
  const header = [
    "You are a collaborative coding tutor inside a pair-programming app.",
    "Rules:",
    "- Do NOT provide full solutions or final code.",
    "- Prefer hints, step-by-step guidance, and conceptual explanations.",
    "- Keep answers concise and actionable.",
  ].join("\n");

  const qBlock = [
    questionTitle ? `Title: ${questionTitle}` : null,
    questionText ? `Problem:\n${questionText}` : null,
    topic ? `Topic: ${topic}` : null,
    difficulty ? `Difficulty: ${difficulty}` : null,
  ].filter(Boolean).join("\n");

  const codeBlock = code ? `\nCurrent Code (${language || "unknown"}):\n"""${code}"""` : "";

  let task;
  switch (mode) {
    case "explain-question":
      task = "Task: Explain the question in your own words. Clarify inputs, outputs, and constraints; suggest a high-level approach and edge cases. Do NOT give the full solution.";
      break;
    case "hint":
      task = "Task: Provide graduated hints (from gentle to specific) that nudge the user forward without writing the answer.";
      break;
    case "explain-code":
      task = "Task: Explain what the provided code does, point out issues, and suggest conceptual improvements. Do NOT rewrite full code.";
      break;
    default:
      task = "Task: Provide helpful guidance without giving a full solution.";
  }

  const userBlock = `\nUser request: ${userMessage || "(none)"}\n`;

  return [header, "", qBlock, codeBlock, "", task, userBlock, "Answer:"].join("\n");
}

router.post("/chat", async (req, res) => {
  try {
    const {
      mode = "hint",
      questionTitle = "",
      questionText = "",
      topic = "",
      difficulty = "",
      code = "",
      language = "",
      userMessage = "",
    } = req.body || {};

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[AI] Missing GEMINI_API_KEY");
      return res.status(500).json({ ok: false, error: "Missing GEMINI_API_KEY" });
    }

    const GoogleGenerativeAI = await getGenAI();
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite" });

    const prompt = buildPrompt({
      mode,
      questionTitle,
      questionText,
      topic,
      difficulty,
      code,
      language,
      userMessage,
    });

    const result = await model.generateContent(prompt);
    const text = result?.response?.text?.() || "Sorry, I couldn't generate a response.";
    return res.json({ ok: true, message: text });
  } catch (err) {
    console.error("[AI /chat] error:", err?.message, err?.stack);
    return res.status(500).json({ ok: false, error: err?.message || "AI error" });
  }
});

router.post("/translate", async (req, res) => {
  try {
    const { code, fromLanguage = "", toLanguage = "python" } = req.body || {};
    if (!code) return res.status(400).json({ ok: false, error: "Missing code" });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[AI] Missing GEMINI_API_KEY");
      return res.status(500).json({ ok: false, error: "Missing GEMINI_API_KEY" });
    }

    const GoogleGenerativeAI = await getGenAI();
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite" });

    const prompt = [
      "Translate the following code to the target language.",
      "Explain briefly any non-trivial changes. Do not change the algorithmic behavior.",
      `From: ${fromLanguage || "unknown"} -> To: ${toLanguage}`,
      'Code:\n"""',
      code,
      '"""',
    ].join("\n");

    const result = await model.generateContent(prompt);
    const text = result?.response?.text?.() || "Sorry, translation failed.";
    return res.json({ ok: true, message: text });
  } catch (err) {
    console.error("[AI /translate] error:", err?.message, err?.stack);
    return res.status(500).json({ ok: false, error: err?.message || "AI error" });
  }
});

export default router;
