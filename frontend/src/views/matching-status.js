import React, { useEffect, useState } from "react";
import axios from "../config/axios";
import { MATCHING_API } from "../constants/api";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, LinearProgress, Typography, Button, Alert } from "@mui/material";
import collaborationService from "../services/collaborationService";
import { useSelector } from "react-redux";

export default function MatchingStatus() {
  const { search } = useLocation();
  const requestId = new URLSearchParams(search).get("rid");
  const navigate = useNavigate();
  const userId = useSelector((state) => state.auth.id);

  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("SEARCHING"); // SEARCHING|MATCHED|TIMEOUT|CANCELLED
  const [partnerUsername, setPartnerUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [currentMessage, setCurrentMessage] = useState("");
  const [countdown, setCountdown] = useState(5);
  const [isMatched, setIsMatched] = useState(false);
  const [countdownStarted, setCountdownStarted] = useState(false);

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
      const delay = 5000
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
    if (isMatched) return; // Stop polling once matched
    let alive = true;
    const poll = async () => {
      try {
        const { data } = await axios.get(MATCHING_API.STATUS(requestId));
        if (!alive) return;
        setStatus(data.status);
        if (data.roomId) setRoomId(data.roomId);
        if (data.topic) setTopic(data.topic);
        if (data.difficulty) setDifficulty(data.difficulty);
        if (data.status === "MATCHED" && data.roomId && !isMatched) {
          setStatus("MATCHED");
          setIsMatched(true);
          if (!countdownStarted) {
            setCountdown(5);
            setCountdownStarted(true);
          }
        }
      } catch {
      }
    };
    poll();
    const t = setInterval(poll, 2000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [requestId, isMatched, countdownStarted]);

  // Listen for sessionCreated WebSocket event
  useEffect(() => {
    collaborationService.initializeSocket();
    
    const handleSessionCreated = (data) => {
      console.log('MatchingStatus received sessionCreated event:', data);
      // Check if this session is for the current user
      const isForCurrentUser = data.participants && userId && data.participants.includes(userId);
      if (isForCurrentUser && status === "SEARCHING" && !isMatched) {
        console.log('Session created for current user, updating status');
        setStatus("MATCHED");
        setRoomId(data.sessionId);
        setTopic(data.topic);
        setDifficulty(data.difficulty);
        setIsMatched(true);
        if (!countdownStarted) {
          setCountdown(5);
          setCountdownStarted(true);
        }
      }
    };

    collaborationService.socket?.on('sessionCreated', handleSessionCreated);
    
    return () => {
      collaborationService.socket?.off('sessionCreated', handleSessionCreated);
    };
  }, [userId, status, isMatched, countdownStarted]);

  // countdown timer for auto-redirect
  useEffect(() => {
    if (!isMatched || !roomId || !countdownStarted) return;

    let currentCount = 5;
    setCountdown(currentCount);

    const timer = setInterval(() => {
      currentCount -= 1;
      setCountdown(currentCount);
      
      if (currentCount <= 0) {
        clearInterval(timer);
        navigate(`/collaboration/${roomId}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isMatched, roomId, navigate, countdownStarted]);

  // cancel match request
  const cancel = async () => {
    try {
      await axios.delete(MATCHING_API.CANCEL(requestId));
      setStatus("CANCELLED");
    } catch {
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

      {status === "MATCHED" && isMatched && (
        <Box sx={{ mt: 4 }}>
          <Alert severity="success" sx={{ mb: 3 }}>
            🎉 Match found! You've been paired with another user.
          </Alert>
          
          <Typography variant="h6" gutterBottom>
            🧩 Match Details
          </Typography>
          <Typography>Partner: <strong>{partnerUsername || "Unknown"}</strong></Typography>
          <Typography>Topic: <strong>{topic || "N/A"}</strong></Typography>
          <Typography>Difficulty: <strong>{difficulty || "N/A"}</strong></Typography>

          <Button
            sx={{ mt: 3, mb: 2 }}
            variant="contained"
            color="primary"
            onClick={() => navigate(`/collaboration/${roomId}`)}
          >
            Go to Collaboration
          </Button>
          
          <Typography variant="body2" color="text.secondary">
            Redirecting in {countdown}...
          </Typography>
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