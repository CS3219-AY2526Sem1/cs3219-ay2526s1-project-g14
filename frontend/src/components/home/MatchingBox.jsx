import { useState, useEffect } from "react";
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
    currentUser,
}) {
    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(false);
    const [matchingStatus, setMatchingStatus] = useState(null); // 'waiting', 'matched', null
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    
    // currentUser is now passed as prop from parent component

    useEffect(() => {
        // Initialize socket connection
        collaborationService.initializeSocket();

        // Listen for match found
        collaborationService.onMatchFound((data) => {
            console.log('🎯 MatchingBox received match-found event for user:', currentUser?.username, currentUser?.userId);
            console.log('🎯 Match data:', data);
            
            // Check if this match is for the current user
            const isForCurrentUser = data.users && currentUser?.userId && data.users.some(user => user.userId === currentUser.userId);
            console.log('🎯 Is this match for current user?', isForCurrentUser);
            
            if (isForCurrentUser) {
                console.log('✅ Match confirmed for user:', currentUser.username);
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
                console.log('❌ Current user ID:', currentUser?.userId);
                console.log('❌ Match user IDs:', data.users?.map(u => u.userId));
            }
        });

        return () => {
            // Cleanup on unmount
            if (matchingStatus === 'waiting' && currentUser?.userId) {
                collaborationService.leaveQueue(currentUser.userId).catch(error => {
                    // Ignore "user not found in queue" errors - this is normal when user was already matched
                    console.log('Queue cleanup:', error.message);
                });
            }
        };
    }, [matchingStatus, navigate, currentUser?.userId]);
    
    const handleStartMatching = async () => {
        if (!selectedTopic || !selectedDifficulty) {
            setError('Please select both topic and difficulty');
            return;
        }

        if (!currentUser || !currentUser.userId) {
            setError('Please select a user first');
            return;
        }

        console.log('🚀 Starting match with user:', currentUser);
        setLoading(true);
        setError(null);
        
        try {
            const result = await collaborationService.joinQueue(
                currentUser.userId,
                currentUser.username,
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
        if (!currentUser?.userId) {
            console.error('No currentUser.userId available');
            return;
        }
        
        try {
            console.log(' Leaving queue for user:', currentUser.userId);
            await collaborationService.leaveQueue(currentUser.userId);
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
        setLoading(true);
        try {
            const question = await fetchOneQuestion(selectedTopic, selectedDifficulty);
            setQuestion(question);
        } catch (err) {
            console.error(err);
            setQuestion(null);
            setError('Failed to fetch question');
        } finally {
            setLoading(false);
        }
    };

  return (
        <Paper sx={{ flex: 1, p: 3, minWidth: 280, border: "1px solid #0091f3", borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#0091f3", mb: 2 }}>
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
                            backgroundColor: "#0091f3",
                            color: "white",
                            textTransform: "none",
                            transition: "0.3s",
                            "&:hover": { backgroundColor: "#0077c2", transform: "scale(1.05)" },
                        }}
                        onClick={handleStartMatching}
                        disabled={loading || !selectedTopic || !selectedDifficulty}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Find Partner'}
                    </Button>
                    
                    <Button
                        variant="outlined"
                        sx={{
                            borderColor: "#0091f3",
                            color: "#0091f3",
                            textTransform: "none",
                            transition: "0.3s",
                            "&:hover": { backgroundColor: "#f0f8ff" },
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