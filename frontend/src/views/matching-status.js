import React, { useEffect, useState } from "react";
import axios from "../config/axios";
import { MATCHING_API } from "../constants/api";
import { useLocation } from "react-router-dom";
import { Box, LinearProgress, Typography, Button } from "@mui/material";

export default function MatchingStatus() {
  const { search } = useLocation();
  const requestId = new URLSearchParams(search).get("rid");

  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("SEARCHING"); // SEARCHING|MATCHED|TIMEOUT|CANCELLED
  const [partnerUsername, setPartnerUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [currentMessage, setCurrentMessage] = useState("");

  // loading messages
  const messages = [
    "Looking for another user...",
    "Aligning topic preferences...",
    "Finalizing your match...",
    "Almost there...",
    "Setting up your collaboration room...",
    "Finalizing match details...",
    "Just a few more seconds...",
    "Checking available matches...",
  ];

  useEffect(() => {
    setCurrentMessage(messages[Math.floor(Math.random() * messages.length)]);
    const rotate = () => {
      const delay = 3000 + Math.random() * 2000; // 3–5s random
      const t = setTimeout(() => {
        setCurrentMessage(messages[Math.floor(Math.random() * messages.length)]);
        rotate();
      }, delay);
      return () => clearTimeout(t);
    };
    const cleanup = rotate();
    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // progress bar
  useEffect(() => {
    const step = 200; // ms
    const inc = 100 / (60000 / step);
    const t = setInterval(() => setProgress((p) => Math.min(100, p + inc)), step);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const { data } = await axios.get(MATCHING_API.STATUS(requestId));
        if (!alive) return;
        setStatus(data.status);
        if (data.partnerUsername) setPartnerUsername(data.partnerUsername);
        if (data.roomId) setRoomId(data.roomId);
        if (data.topic) setTopic(data.topic);
        if (data.difficulty) setDifficulty(data.difficulty);
      } catch {
        /* ignore transient network errors */
      }
    };
    poll();
    const t = setInterval(poll, 2000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [requestId]);

  // cancel match request
  const cancel = async () => {
    try {
      await axios.delete(MATCHING_API.CANCEL(requestId));
      setStatus("CANCELLED");
    } catch {
      /* ignore */
    }
  };

  const headline =
    status === "MATCHED"
      ? `✅ Successfully matched with ${partnerUsername || "user"}!`
      : status === "TIMEOUT"
      ? "Match timed out. Please try again."
      : status === "CANCELLED"
      ? "Matching cancelled."
      : currentMessage;

  return (
    <Box sx={{ maxWidth: 640, mx: "auto", mt: 10, textAlign: "center" }}>
      <Typography variant="h5" gutterBottom>
        {headline}
      </Typography>

      {status === "SEARCHING" && (
        <>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ mt: 2, height: 10, borderRadius: 5 }}
          />
          <Button onClick={cancel} sx={{ mt: 3 }}>
            Cancel
          </Button>
        </>
      )}

      {status === "MATCHED" && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            🧩 Match Details
          </Typography>
          <Typography>Partner: <strong>{partnerUsername || "Unknown"}</strong></Typography>
          <Typography>Topic: <strong>{topic || "N/A"}</strong></Typography>
          <Typography>Difficulty: <strong>{difficulty || "N/A"}</strong></Typography>

          <Button
            sx={{ mt: 3 }}
            variant="outlined"
            disabled
          >
            Go to Collaboration
          </Button>
        </Box>
      )}

      {(status === "TIMEOUT" || status === "CANCELLED") && (
        <Button sx={{ mt: 3 }} onClick={() => window.history.back()}>
          Back to Home
        </Button>
      )}
    </Box>
  );
}