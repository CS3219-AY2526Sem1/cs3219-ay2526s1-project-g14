/**
 * AI Usage
 * This file contains code enhanced with GitHub Copilot assistance.
 * Specific improvements: active session detection, question availability checking, and comments.
 * See /ai-usage-log.md for detailed attribution and modifications.
 * Date: 2025-10-25
 */

import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Box, Paper, Typography, Button, Alert, CircularProgress } from "@mui/material";
import Filters from "../Filters";
import { fetchOneQuestion, fetchQuestions } from "../../controller/questionsController";
import QuestionCard from "../QuestionCard";
import collaborationService from "../../services/collaborationService";
import RejoinSessionModal from "./RejoinSessionModal";

export default function MatchingBox({
    topics,
    selectedTopic,
    setSelectedTopic,
    selectedDifficulty,
    setSelectedDifficulty,
    username,
}) {
    const userId = useSelector((state) => state.auth.id);

    const navigate = useNavigate();
    const [requestId, setRequestId] = useState(null);
    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(false);
    const [matchingStatus, setMatchingStatus] = useState(null); // 'waiting', 'matched', null
    const [error, setError] = useState(null);
    const [questionsAvailable, setQuestionsAvailable] = useState(true);
    const [checkingQuestions, setCheckingQuestions] = useState(false);
    const [showRejoinModal, setShowRejoinModal] = useState(false);
    const [activeSessionId, setActiveSessionId] = useState(null);

    const pollRef = useRef(null);
    
    // Check for active session on mount
    useEffect(() => {
        const checkActiveSession = async () => {
            if (!userId) return;
            
            try {
                const response = await collaborationService.getUserSession(userId);
                if (response?.payload?.sessionId) {
                    setActiveSessionId(response.payload.sessionId);
                    setShowRejoinModal(true);
                }
            } catch (err) {
                console.log('No active session found');
            }
        };
        
        checkActiveSession();
    }, [userId]);
    
    useEffect(() => {
        // Initialize socket connection
        collaborationService.initializeSocket();

        // Listen for match found
        collaborationService.onMatchFound((data) => {
            console.log('MatchingBox received match-found event for user:', username, userId);
            console.log('Match data:', data);
            
            // Check if this match is for the current user
            const isForCurrentUser = data.users && userId && data.users.some(user => user.userId === userId);
            console.log('Is this match for current user?', isForCurrentUser);
            
            if (isForCurrentUser) {
                console.log('Match confirmed for user:', username);
                setMatchingStatus('matched');
                setLoading(false);
                setError(null); // Clear any previous errors
                
                // Navigate to collaboration session
                console.log('Navigating to collaboration session:', data.sessionId);
                setTimeout(() => {
                    navigate(`/collaboration/${data.sessionId}`);
                }, 2000);
            } else {
                console.log('Match not for current user, ignoring');
                console.log('Current user ID:', userId);
                console.log('Match user IDs:', data.users?.map(u => u.userId));
            }
        });

        return () => {
            // Cleanup on unmount
            if (matchingStatus === 'waiting' && userId) {
                collaborationService.leaveQueue(userId).catch(error => {
                    // Ignore "user not found in queue" errors - this is normal when user was already matched
                    console.log('Queue cleanup:', error.message);
                });
            }
        };
    }, [matchingStatus, navigate, userId]);

    // Check question availability when topic/difficulty changes
    useEffect(() => {
        const checkQuestionAvailability = async () => {
            if (!selectedTopic || !selectedDifficulty) {
                setQuestionsAvailable(true);
                return;
            }

            setCheckingQuestions(true);
            try {
                const questions = await fetchQuestions(selectedTopic, selectedDifficulty);
                setQuestionsAvailable(questions && questions.length > 0);
                if (!questions || questions.length === 0) {
                    setError(`No questions available for ${selectedDifficulty} ${selectedTopic}`);
                } else {
                    setError(null);
                }
            } catch (err) {
                console.error('Error checking questions:', err);
                setQuestionsAvailable(false);
                setError('Failed to check question availability');
            } finally {
                setCheckingQuestions(false);
            }
        };

        checkQuestionAvailability();
    }, [selectedTopic, selectedDifficulty]);
    
    const handleStartMatching = async () => {
        if (!selectedTopic || !selectedDifficulty) {
            setError('Please select both topic and difficulty');
            return;
        }

        console.log('Starting match with user:', username);
        setLoading(true);
        setError(null);
        setMatchingStatus(null);
        

    try {
        const data = await collaborationService.joinQueue({
          topic: selectedTopic,
          difficulty: selectedDifficulty,
        });
  
        // Expect { requestId, status } from backend
        const rid = data?.requestId;
        if (!rid) {
          throw new Error(data?.error || "Missing requestId from matching start");
        }
  
        setRequestId(rid);

        // Always navigate to status page first, regardless of immediate match
        setLoading(false);
        navigate(`/match?rid=${encodeURIComponent(rid)}`);
      } catch (err) {
        console.error(err);
        
        // Check if user has an active session (409 Conflict)
        if (err.response?.status === 409) {
          const sessionId = err.response.data?.sessionId;
          if (sessionId) {
            setActiveSessionId(sessionId);
            setShowRejoinModal(true);
          } else {
            setError(err.response.data?.message || 'You have an active session');
          }
        } else {
          setError(err.message || "Failed to start matching");
        }
        setLoading(false);
      }
    };
    
    const handleCancelMatching = async () => {
        if (!requestId) {
          console.error("No requestId to cancel");
          return;
        }
        try {
          await collaborationService.leaveQueue(requestId);
          if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
          setMatchingStatus(null);
          setLoading(false);
          setError(null);
        } catch (err) {
          console.error("Error cancelling match:", err);
          setError(err.message || "Failed to cancel match");
        }
      }; 

    const handlePracticeAlone = async () => {
        if (!selectedTopic || !selectedDifficulty) {
            setError('Select a topic and difficulty first');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Fetch a random question for the selected topic & difficulty
            const question = await fetchOneQuestion(selectedTopic, selectedDifficulty);

            if (!question) {
                setError('No question found');
                return;
            }

            // Create a session directly with the current user only
            const payload = {
                users: [
                    { userId: userId, username: username }
                ],
                difficulty: selectedDifficulty,
                topic: selectedTopic,
                questionData: question 
            };
            const sessionResponse = await collaborationService.createSession(payload);
            console.log('Session created:', sessionResponse.payload.sessionId);
            navigate(`/collaboration/${sessionResponse.payload.sessionId}`);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to create session');
        } finally {
            setLoading(false);
        }
    };

    const handleEndSession = async () => {
        try {
            if (activeSessionId) {
                await collaborationService.endSession(activeSessionId);
                setActiveSessionId(null);
            }
        } catch (err) {
            console.error('Failed to end session:', err);
            setError(err.message || 'Failed to end session');
        }
    };

    return (
        <>
        <RejoinSessionModal 
            open={showRejoinModal}
            onClose={() => setShowRejoinModal(false)}
            sessionId={activeSessionId}
            onEndSession={handleEndSession}
        />
        
        <Paper sx={{ 
            flex: 1, 
            p: 3, 
            minWidth: 280, 
            border: "1px solid #EDF2FF", 
            borderRadius: 2,
            opacity: showRejoinModal ? 0.5 : 1,
            pointerEvents: showRejoinModal ? 'none' : 'auto',
            filter: showRejoinModal ? 'blur(2px)' : 'none',
            transition: 'all 0.3s ease'
        }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "black", mb: 2 }}>
            {matchingStatus === 'waiting' ? 'Finding Partner...' : 
             matchingStatus === 'matched' ? 'Match Found!' : 'Start Matching'}
        </Typography>

        {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
        )}

        {matchingStatus === 'matched' && (
            <Alert severity="success" sx={{ mb: 2 }}>
                Match found! Redirecting to collaboration session...
            </Alert>
        )}

        {matchingStatus === 'waiting' && (
            <Alert severity="info" sx={{ mb: 2 }}>
                Waiting for a partner with {selectedDifficulty} difficulty and {selectedTopic} topic...
            </Alert>
        )}

        <Filters
            topics={topics}
            selectedTopic={selectedTopic}
            setSelectedTopic={setSelectedTopic}
            selectedDifficulty={selectedDifficulty}
            setSelectedDifficulty={setSelectedDifficulty}
            disabled={matchingStatus === 'waiting' || matchingStatus === 'matched'}
        />

        <Box sx={{ display: 'flex', gap: 1, mt: 2, flexDirection: 'column' }}>
            {matchingStatus === 'waiting' ? (
                <Button
                    variant="outlined"
                    color="error"
                    sx={{ textTransform: "none" }}
                    onClick={handleCancelMatching}
                    disabled={loading}
                >
                    Cancel Matching
                </Button>
            ) : matchingStatus === 'matched' ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    <Typography>Preparing session...</Typography>
                </Box>
            ) : (
                <>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: "#EDF2FF",
                            color: "black",
                            textTransform: "none",
                            transition: "0.3s",
                            "&:hover": { backgroundColor: "#D6E0FF", transform: "scale(1.05)" },
                        }}
                        onClick={handleStartMatching}
                        disabled={loading || !selectedTopic || !selectedDifficulty || !questionsAvailable || checkingQuestions}
                    >
                        {checkingQuestions ? <CircularProgress size={24} color="inherit" /> : 
                         loading ? <CircularProgress size={24} color="inherit" /> : 
                         'Find Partner'}
                    </Button>
                </>
            )}
        </Box>

        {question && !loading && !matchingStatus && (
            <Box paddingTop={2}>
                <QuestionCard question={question} />
            </Box>
        )}
        </Paper>
        </>
    );
}