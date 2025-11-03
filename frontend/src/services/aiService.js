import backendAxios from "../config/axios";

export async function aiChat(payload) {
  // payload expected:
  // { mode, questionTitle, questionText, topic, difficulty, code, language, userMessage }
  const { data } = await backendAxios.post("/ai/chat", payload);
  return data; // { ok, message, error }
}

export async function aiTranslate(payload) {
  // payload expected:
  // { code, fromLanguage, toLanguage }
  const { data } = await backendAxios.post("/ai/translate", payload);
  return data; // { ok, message, error }
}
