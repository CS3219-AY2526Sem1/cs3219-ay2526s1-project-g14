import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Button,
  Chip,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  CircularProgress,
  Fade,
  Fab,
} from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import TranslateIcon from "@mui/icons-material/Translate";
import { aiChat, aiTranslate } from "../../services/aiService";
import backendAxios from "../../config/axios";

/* ---------------------- minimal markdown renderer ---------------------- */
function escapeHtml(s) {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
function mdToHtml(raw) {
  if (!raw) return "";
  let s = escapeHtml(raw);

  // Fenced code blocks
  s = s.replace(/```([\s\S]*?)```/g, (_, code) => {
    const inner = code.replace(/^\s*\n|\n\s*$/g, "");
    return `<pre style="background:#0b1020;color:#e6e6e6;padding:10px;border-radius:8px;overflow:auto;"><code>${inner}</code></pre>`;
  });

  // Headings
  s = s.replace(/^### (.*)$/gm, "<h3>$1</h3>");
  s = s.replace(/^## (.*)$/gm, "<h2>$1</h2>");
  s = s.replace(/^# (.*)$/gm, "<h1>$1</h1>");

  // Bold / Italic
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Inline code
  s = s.replace(/`([^`]+?)`/g, "<code style='background:#f1f3f5;padding:1px 4px;border-radius:4px;'>$1</code>");

  // Links
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, `<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>`);

  // Ordered list lines -> wrap
  s = s.replace(/^\s*\d+\.\s+(.+)$/gm, "<li>$1</li>");
  s = s.replace(/(?:<li>.*<\/li>\n?)+/g, (block) => `<ol>${block}</ol>`);
  // Unordered list lines -> wrap
  s = s.replace(/^\s*[-*]\s+(.+)$/gm, "<li>$1</li>");
  s = s.replace(/(?:<li>.*<\/li>\n?)+/g, (block) => {
    if (block.startsWith("<ol>")) return block;
    return `<ul>${block}</ul>`;
  });

  // Paragraphs
  s = s
    .split(/\n{2,}/)
    .map((para) => {
      if (para.match(/^<h[1-3]>/) || para.startsWith("<pre") || para.startsWith("<ul>") || para.startsWith("<ol>"))
        return para;
      return `<p>${para.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("");

  return s;
}
/* ---------------------------------------------------------------------- */

const LANG_OPTIONS = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
];

function prettyLang(v) {
  const found = LANG_OPTIONS.find((x) => x.value === v);
  return found ? found.label : v;
}

/**
 * AiAssistantWidget UI
 *
 * Props:
 *  - sessionId, userId, username (optional, just for context text)
 *  - questionId?: string|object
 *  - question?: string|object
 *  - language: string
 *  - getCode: () => string            // returns latest editor code
 *  - code?: string                    
 *  - chatMessages?: Array<{sender, message}>
 *  - dockOffsetPx?: number            
 */
export default function AiAssistantWidget({
  sessionId,
  userId,
  username,
  questionId,
  question,
  language = "javascript",
  getCode = () => "",
  code: codeProp = "",
  chatMessages = [],
  dockOffsetPx = 100,
}) {
  const [open, setOpen] = useState(false);
  const [targetLang, setTargetLang] = useState("python");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState(() => [
    {
      role: "assistant",
      content:
        "Hi! I’m PeerPrep AI. Ask about the question, get a hint, understand the code, or translate it.",
      isMarkdown: true,
    },
  ]);
  const [fullQuestion, setFullQuestion] = useState(null);
  const [ctxError, setCtxError] = useState("");
  const [currentMode, setCurrentMode] = useState("hint"); // "hint" | "explain-question" | "explain-code"
  const scrollRef = useRef(null);

  // Normalize question prop(s)
  const rawQ = useMemo(() => (question !== undefined ? question : questionId), [question, questionId]);
  const isQuestionObject = (q) =>
    q && typeof q === "object" && (q.title || q.description || q.body || q.prompt || q.content);
  const stringLooksLikeMongoId = (s) => typeof s === "string" && /^[a-fA-F0-9]{24}$/.test(s);
  const stringLooksLikeGenericId = (s) => typeof s === "string" && s.length >= 10;
  const resolvedId = useMemo(() => {
    if (!rawQ) return null;
    if (isQuestionObject(rawQ)) return rawQ._id || rawQ.id || null;
    if (typeof rawQ === "string") return rawQ;
    return null;
  }, [rawQ]);

  async function fetchQuestionById(id) {
    const candidates = [
      `/questions/${id}`, 
      `/questions/by-question-id/${id}`,
      `/question/${id}`,
      `/api/questions/${id}`,
      `/api/question/${id}`,
    ];
    for (const path of candidates) {
      try {
        const { data } = await backendAxios.get(path);
        const payload = data?.payload ?? data?.question ?? data;
        if (isQuestionObject(payload)) return payload;
      } catch {}
    }
    throw new Error("No question endpoint responded with details");
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setCtxError("");
        if (isQuestionObject(rawQ)) {
          if (!cancelled) setFullQuestion(rawQ);
          return;
        }
        if (typeof rawQ === "string" && (stringLooksLikeMongoId(rawQ) || stringLooksLikeGenericId(rawQ))) {
          const q = await fetchQuestionById(rawQ);
          if (!cancelled) setFullQuestion(q);
          return;
        }
        setCtxError("No question detected.");
      } catch {
        setCtxError("Failed to load question context.");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawQ, resolvedId]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, busy, open]);

  // Code capture (live)
  function getEditorCodeFallback() {
    try {
      if (window.__editor?.getValue) return window.__editor.getValue();
      if (window.monacoEditor?.getValue) return window.monacoEditor.getValue();
      const cm = document.querySelector(".cm-content");
      if (cm && cm.textContent) return cm.textContent;
      const ta = document.querySelector("textarea");
      if (ta?.value) return ta.value;
      const view = document.querySelector(".monaco-editor .view-lines");
      if (view?.textContent) return view.textContent;
      const marked = document.querySelector("[data-ai-code]");
      if (marked) return marked.textContent || marked.value || "";
    } catch {}
    return "";
  }
  function getCurrentCode() {
    const primary = (typeof getCode === "function" ? getCode() : "") || "";
    if (primary && primary.trim().length > 0) return primary;
    if (codeProp && codeProp.trim().length > 0) return codeProp;
    return getEditorCodeFallback();
  }

  // Message helpers
  const push = (role, content, isMarkdown = true) =>
    setMessages((prev) => [...prev, { role, content, isMarkdown }]);

  // Quick prompts
  const quickPrompts = [
    { label: "Explain question", mode: "explain-question" },
    { label: "Give a hint", mode: "hint" },
    { label: "Explain my code", mode: "explain-code" },
  ];

  const onQuickPrompt = (p) => {
    setCurrentMode(p.mode);
    handleSend(p.label, p.mode);
  };

  // Send (chat)
  async function handleSend(customMessage, forcedMode) {
    const userText = (customMessage ?? input).trim();
    if (!userText) return;

    // block requests for full solutions
    const lowered = userText.toLowerCase();
    const disallowed =
      lowered.includes("full solution") ||
      lowered.includes("complete solution") ||
      lowered.includes("final code") ||
      lowered.includes("just give code") ||
      lowered.includes("paste the solution");
    if (disallowed) {
      push(
        "user",
        userText,
        false
      );
      push(
        "assistant",
        "I can’t give the full solution, but I can offer hints or explain the approach. What part would you like to understand better?",
        true
      );
      setInput("");
      return;
    }

    const mode = forcedMode || currentMode || "hint";
    // Always pull LIVE code
    const code = getCurrentCode();

    // Build question context
    const q = fullQuestion || {};
    const qTitle = q.title || q.name || "";
    const qText = q.description || q.body || q.statement || q.prompt || q.content || "";
    const qTopic = Array.isArray(q.topic) ? q.topic.join(", ") : q.topic || "";
    const qDifficulty = q.difficulty || q.level || "";
    const examplesStr =
      Array.isArray(q.examples) && q.examples.length
        ? "\n\nExamples:\n" +
          q.examples.map((ex, idx) => `- Example ${idx + 1}\n  Input: ${ex.input}\n  Output: ${ex.output}`).join("\n")
        : "";

    // Keep short history for multi-turn context (client-side only)
    const recentChat =
      chatMessages?.length
        ? chatMessages
            .slice(-5)
            .map((m) => `${m.sender || "User"}: ${m.message || m.text || ""}`)
            .join("\n")
        : "";

    setMessages((prev) => [...prev, { role: "user", content: userText, isMarkdown: false }]);
    setInput("");
    setBusy(true);

    try {
      const { ok, message, error } = await aiChat({
        mode, // "hint" | "explain-question" | "explain-code"
        questionTitle: qTitle,
        questionText: `${qText}\n\nTopic: ${qTopic}\nDifficulty: ${qDifficulty}${examplesStr}`,
        topic: qTopic,
        code, // live code included
        language,
        userMessage: `${userText}${recentChat ? `\n\nRecent chat:\n${recentChat}` : ""}`,
      });
      if (!ok) throw new Error(error || "AI failed");
      push("assistant", message, true);
    } catch (err) {
      push("assistant", `Oops—something went wrong: ${err.message || err}`, false);
    } finally {
      setBusy(false);
    }
  }

  // Translate button
  async function onTranslateClick() {
    setCurrentMode("translate");
    const code = getCurrentCode();
    if (!code?.trim()) {
      push("assistant", "There’s no code to translate yet.", true);
      return;
    }
    push("user", `Translate my code to ${prettyLang(targetLang)}`, false);
    setBusy(true);
    try {
      const { ok, message, error } = await aiTranslate({
        code,
        fromLanguage: language,
        toLanguage: targetLang,
      });
      if (!ok) throw new Error(error || "Translate failed");
      push("assistant", message, true);
    } catch (err) {
      push("assistant", `Oops—something went wrong: ${err.message || err}`, false);
    } finally {
      setBusy(false);
    }
  }

  const ctxLoaded =
    !!(fullQuestion && (fullQuestion.title || fullQuestion.description || fullQuestion.body || fullQuestion.prompt));

  return (
    <>
      {/* small banner above the FAB */}
      {!open && (
        <Fade in>
          <Paper
            elevation={3}
            sx={{
              position: "fixed",
              right: 24,
              bottom: dockOffsetPx + 56,
              zIndex: 1199,
              display: "flex",
              alignItems: "center",
              px: 1.25,
              py: 0.5,
              borderRadius: 1.5,
              bgcolor: "#ffffff",
              border: "1px solid #e0e0e0",
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            }}
          >
            <SmartToyIcon fontSize="small" sx={{ mr: 0.75 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Need help?
            </Typography>
          </Paper>
        </Fade>
      )}

      {!open && (
        <Fab
          color="primary"
          onClick={() => setOpen(true)}
          sx={{ position: "fixed", right: 24, bottom: dockOffsetPx, zIndex: 1200 }}
          aria-label="PeerPrep AI assistant"
        >
          <SmartToyIcon />
        </Fab>
      )}

      <Fade in={open}>
        <Paper
          elevation={6}
          sx={{
            position: "fixed",
            right: 24,
            bottom: dockOffsetPx,
            zIndex: 1300,
            width: 440,
            maxWidth: "95vw",
            maxHeight: "72vh",
            display: "flex",
            flexDirection: "column",
            borderRadius: 2,
            bgcolor: "#fff",
          }}
        >
          {/* header */}
          <Box sx={{ display: "flex", alignItems: "center", p: 1.5, pb: 1 }}>
            <SmartToyIcon sx={{ mr: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mr: 1 }}>
              PeerPrep AI
            </Typography>
            {ctxLoaded ? (
              <Chip size="small" color="success" label={fullQuestion?.title?.slice(0, 36) || "Question loaded"} />
            ) : (
              <Chip
                size="small"
                color="warning"
                label={ctxError ? "No question context" : "Loading question…"}
              />
            )}
            <Box sx={{ flexGrow: 1 }} />
            <Tooltip title="Close">
              <IconButton size="small" onClick={() => setOpen(false)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* quick prompts + translate row */}
          <Box sx={{ px: 1.5, pb: 1 }}>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {quickPrompts.map((p) => (
                <Chip
                  key={p.label}
                  label={p.label}
                  onClick={() => onQuickPrompt(p)}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              ))}
            </Box>

            <Box sx={{ mt: 1.25, display: "flex", alignItems: "center", gap: 1 }}>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id="ai-target-lang-label">Translate to</InputLabel>
                <Select
                  labelId="ai-target-lang-label"
                  label="Translate to"
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                >
                  {LANG_OPTIONS.map((l) => (
                    <MenuItem key={l.value} value={l.value}>
                      {l.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                size="small"
                startIcon={<TranslateIcon />}
                onClick={onTranslateClick}
              >
                Translate code
              </Button>
            </Box>
          </Box>

          <Divider />

          {/* messages */}
          <Box
            ref={scrollRef}
            sx={{ px: 1.5, pt: 1, pb: 1, overflowY: "auto", flex: 1, background: "#fff" }}
          >
            {messages.map((m, i) => (
              <Box
                key={i}
                sx={{
                  mb: 1.25,
                  display: "flex",
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <Box
                  sx={{
                    maxWidth: "85%",
                    px: 1.25,
                    py: 0.75,
                    borderRadius: 1.5,
                    bgcolor: m.role === "user" ? "#e3f2fd" : "#f5f5f5",
                    border: "1px solid #e0e0e0",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    fontSize: 14,
                  }}
                >
                  {m.isMarkdown ? (
                    <div style={{ lineHeight: 1.35 }} dangerouslySetInnerHTML={{ __html: mdToHtml(m.content) }} />
                  ) : (
                    m.content
                  )}
                </Box>
              </Box>
            ))}
            {busy && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
                <CircularProgress size={20} />
              </Box>
            )}
          </Box>

          {/* input row */}
          <Box sx={{ display: "flex", gap: 1, p: 1.25 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Ask about the question, your code, or request a translation…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!busy) handleSend();
                }
              }}
            />
            <Tooltip title="Send">
              <span>
                <IconButton
                  color="primary"
                  onClick={() => handleSend()}
                  disabled={busy || !input.trim()}
                >
                  <SendIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Paper>
      </Fade>
    </>
  );
}