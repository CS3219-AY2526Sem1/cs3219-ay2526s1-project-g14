import React, { useEffect, useState } from "react";
import axios from "../config/axios";
import { MATCHING_API } from "../constants/api";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, LinearProgress, Typography, Button, Alert } from "@mui/material";
import collaborationService from "../services/collaborationService";
import { useSelector } from "react-redux";

const selectUsername = (s) => s.auth.username;
const selectUserId   = (s) => s.auth.id;

export default function MatchingStatus() {
  const { search } = useLocation();
  const requestId = new URLSearchParams(search).get("rid");
  const navigate = useNavigate();
  const userId   = useSelector(selectUserId);      // may be undefined
  const username = useSelector(selectUsername);  

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
  const [timeoutCountdown, setTimeoutCountdown] = useState(5);

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

  const getPartnerUsername = async (sId, myId, myUsername) => {
    try {
      const res = await collaborationService.getSession(sId);
      const sess = res.payload;
      if (!sess?.participants?.length) return "";

      const parts = sess.participants.map(p => p?.userId).filter(Boolean);

      // find me first
      const meById =
        myId && parts.find(u => String(u._id) === String(myId));
      const meByName =
        !meById && myUsername
          ? parts.find(
              u => (u.username || "").toLowerCase() === myUsername.toLowerCase()
            )
          : null;
      const myActualId = String(meById?._id || meByName?._id || "");

      // find the other person
      const partner = parts.find(u => String(u._id) !== myActualId);
      return partner?.username || "";
    } catch (err) {
      console.error("Error retrieving partner username", err);
      return "";
    }
  };

    

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

    // when progress reaches 100% and still not matched → TIMEOUT
    useEffect(() => {
      if (progress >= 100 && status === "SEARCHING" && !isMatched) {
        (async () => {
          try {
            // best-effort: remove from queue server-side
            await axios.delete(MATCHING_API.CANCEL(requestId));
          } catch {}
          setStatus("TIMEOUT");
          setTimeoutCountdown(5);
        })();
      }
    }, [progress, status, isMatched, requestId]);

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
          const uname = await getPartnerUsername(data.roomId, userId, username);
          if (uname) setPartnerUsername(uname);
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
    
    const handleSessionCreated = async (data) => {
      console.log('MatchingStatus received sessionCreated event:', data);
      // Check if this session is for the current user
      const isForCurrentUser = Array.isArray(data.participants)
      && (userId
           ? data.participants.map(String).includes(String(userId))
           : true); // if id missing, still try (we’ll verify via session fetch)
  
    if (isForCurrentUser && status === "SEARCHING" && !isMatched) {
      setStatus("MATCHED");
      setRoomId(data.sessionId);
      setTopic(data.topic);
      setDifficulty(data.difficulty);
      const uname = await getPartnerUsername(data.sessionId, userId, username);
      if (uname) setPartnerUsername(uname);
      setIsMatched(true);
      if (!countdownStarted) { setCountdown(5); setCountdownStarted(true); }
    }
  };

    collaborationService.socket?.on('sessionCreated', handleSessionCreated);
    
    return () => {
      collaborationService.socket?.off('sessionCreated', handleSessionCreated);
    };
  }, [userId, status, isMatched, countdownStarted]);

  // countdown timer for auto-redirect AFTER MATCHED
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

    // countdown timer for auto-redirect AFTER TIMEOUT
    useEffect(() => {
      if (status !== "TIMEOUT") return;
  
      let current = 5;
      setTimeoutCountdown(current);
      const timer = setInterval(() => {
        current -= 1;
        setTimeoutCountdown(current);
        if (current <= 0) {
          clearInterval(timer);
          navigate("/");
        }
      }, 1000);
  
      return () => clearInterval(timer);
    }, [status, navigate]);

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

      {status === "TIMEOUT" && (
        <Box sx={{ mt: 4 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            No match found within 60 seconds. Please try again.
          </Alert>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Redirecting to home in {timeoutCountdown}...
          </Typography>
          <Button variant="outlined" onClick={() => navigate("/")}>
            Go to Home
          </Button>
        </Box>
      )}

      {(status === "CANCELLED") && (
        <Button sx={{ mt: 3 }} onClick={() => window.history.back()}>
          Back to Home
        </Button>
      )}
    </Box>
  );
}