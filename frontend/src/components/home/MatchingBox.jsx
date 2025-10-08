import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Box, Paper, Typography, Button, Alert, CircularProgress } from "@mui/material";
import Filters from "../Filters";
import { fetchOneQuestion } from "../../controller/questionsController";
import QuestionCard from "../QuestionCard";
import collaborationService from "../../services/collaborationService";
import { useNavigate } from "react-router-dom";

export default function MatchingBox({
    topics,
    selectedTopic,
    setSelectedTopic,
    selectedDifficulty,
    setSelectedDifficulty,
    username,
}) {
    const userId = useSelector((state) => state.auth.id);

    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(false);
    const [matchingStatus, setMatchingStatus] = useState(null); // 'waiting', 'matched', null
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    
    useEffect(() => {
        // Initialize socket connection
        collaborationService.initializeSocket();

        // Listen for match found
        collaborationService.onMatchFound((data) => {
            console.log('🎯 MatchingBox received match-found event for user:', username, userId);
            console.log('🎯 Match data:', data);
            
            // Check if this match is for the current user
            const isForCurrentUser = data.users && userId && data.users.some(user => user.userId === userId);
            console.log('🎯 Is this match for current user?', isForCurrentUser);
            
            if (isForCurrentUser) {
                console.log('✅ Match confirmed for user:', username);
                setMatchingStatus('matched');
                setLoading(false);
                setError(null); // Clear any previous errors
                
                // Navigate to collaboration session
                console.log('🚀 Navigating to collaboration session:', data.sessionId);
                setTimeout(() => {
                    navigate(`/collaboration/${data.sessionId}`);
                }, 2000);
            } else {
                console.log('❌ Match not for current user, ignoring');
                console.log('❌ Current user ID:', userId);
                console.log('❌ Match user IDs:', data.users?.map(u => u.userId));
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
    
    const handleStartMatching = async () => {
        if (!selectedTopic || !selectedDifficulty) {
            setError('Please select both topic and difficulty');
            return;
        }

        if (username || userId) {
            setError('Please select a user first');
            return;
        }

        console.log('🚀 Starting match with user:', username);
        setLoading(true);
        setError(null);
        
        try {
            const result = await collaborationService.joinQueue(
                userId,
                username,
                selectedDifficulty,
                selectedTopic
            );

            if (result.payload.matched) {
                // Immediate match found
                setMatchingStatus('matched');
                setTimeout(() => {
                    navigate(`/collaboration/${result.payload.sessionId}`);
                }, 2000);
            } else {
                // Added to queue, waiting for match
                setMatchingStatus('waiting');
            }
        } catch (err) {
            console.error(err);
            setError(err.message);
            setLoading(false);
        }
    };

    const handleCancelMatching = async () => {
        console.log('Cancel matching clicked');
        if (userId) {
            console.error('No userId available');
            return;
        }
        
        try {
            console.log(' Leaving queue for user:', userId);
            await collaborationService.leaveQueue(userId);
            setMatchingStatus(null);
            setLoading(false);
            setError(null);
            console.log('✅ Successfully left queue');
        } catch (err) {
            console.error('❌ Error leaving queue:', err);
            setError(err.message);
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
            // For now, just use the current user as the only participant
            const payload = {
                users: [
                    { userId: userId, username: username },
                    { userId: "68e3aa7f194289b0adf5ecaf", username: "rach" }
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

    return (
        <Paper sx={{ flex: 1, p: 3, minWidth: 280, border: "1px solid #EDF2FF", borderRadius: 2 }}>
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
                        disabled={loading || !selectedTopic || !selectedDifficulty}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Find Partner'}
                    </Button>
                    
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: "#EDF2FF",
                            color: "black",
                            textTransform: "none",
                            transition: "0.3s",
                            "&:hover": { backgroundColor: "#D6E0FF" },
                        }}
                        onClick={handlePracticeAlone}
                        disabled={loading || !selectedTopic || !selectedDifficulty}
                    >
                        Practice Alone
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
    );
}