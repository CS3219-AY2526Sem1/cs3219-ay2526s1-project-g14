/**
 * AI Usage
 * This file contains code enhanced with GitHub Copilot assistance.
 * Specific improvements: resizable chat panel, WebSocket cleanup, and comments.
 * See /ai-usage-log.md for detailed attribution and modifications.
 * Date: 2025-10-28
 * 
 * This file contains code enhanced with ChatGPT assistance.
 * Specific improvements: debugged and refined handleSaveCode logic, and added structured payload for user attempt submission
 * See /ai-usage-log.md for detailed attribution and modifications.
 * Date: 2025-11-08
 */

import { useState, useEffect, useRef } from 'react';
import { useSelector } from "react-redux";
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Alert,
} from '@mui/material';
import collaborationService from '../services/collaborationService';
import TopBar from '../components/collaboration/TopBar';
import QuestionPanel from '../components/collaboration/QuestionPanel/QuestionPanel';
import CodeEditorPanel from '../components/collaboration/CodeEditorPanel';
import ChatPanel from '../components/collaboration/ChatPanel';
import userAttemptAxios from "../config/userAttemptAxios";
import { API } from "../constants/api";
import AiAssistantWidget from '../components/ai/AiAssistantWidget';

export default function CollaborationSession() {
    const { sessionId } = useParams();
    const navigate = useNavigate();

    const username = useSelector((state) => state.auth.username);
    const reduxUserId = useSelector((state) => state.auth.id);

    // session state
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [question, setQuestion] = useState(null);
    const [startTime, setStartTime] = useState(null);

    // code editor state
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');

    // chat state
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    // connection state
    const [connectedUsers, setConnectedUsers] = useState([]);
    const [partnerUser, setPartnerUser] = useState(null);

    // resize state
    const [chatHeight, setChatHeight] = useState(200);
    const isResizing = useRef(false);

    useEffect(() => {
        // Redirect to home if no sessionId provided
        if (!sessionId) {
            navigate('/');
            return;
        }

        // Setup socket listeners FIRST, then load session
        setupSocketListeners();
        loadSession();

        return () => {
            collaborationService.disconnect();
        };
    }, [sessionId, navigate]);

    // Resize handler
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing.current) return;

            const container = document.getElementById('right-panel-container');
            if (!container) return;

            const containerRect = container.getBoundingClientRect();
            const newChatHeight = containerRect.bottom - e.clientY;

            // Constrain between 150px and 80% of container height
            const maxHeight = containerRect.height * 0.8;
            if (newChatHeight >= 150 && newChatHeight <= maxHeight) {
                setChatHeight(newChatHeight);
            }
        };

        const handleMouseUp = () => {
            isResizing.current = false;
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const handleResizeMouseDown = (e) => {
        isResizing.current = true;
        document.body.style.cursor = 'ns-resize';
        document.body.style.userSelect = 'none';
        e.preventDefault();
    };

    const loadSession = async () => {
        try {
            if (!sessionId) {
                navigate('/');
                return;
            }

            const response = await collaborationService.getSession(sessionId);
            const sessionData = response.payload;

            // Check if session is already completed or cancelled
            if (sessionData.status === 'completed' || sessionData.status === 'cancelled') {
                setError('This session has ended and is no longer available');
                setTimeout(() => navigate('/'), 2000);
                return;
            }

            setSession(sessionData);
            console.log("sessionData", sessionData);
            console.log("questionId from session:", sessionData.questionId);
            setQuestion(sessionData.questionId);
            setCode(sessionData.code || '');
            setLanguage(sessionData.language || 'javascript');
            setChatMessages(sessionData.chatHistory || []);
            setStartTime(sessionData.startTime)

            // Find partner
            const parts = sessionData.participants || [];

            // Get userId from Redux - MUST have valid userId
            const myId = reduxUserId ? String(reduxUserId) : null;

            if (!myId) {
                console.error('No userId in Redux state!', { reduxUserId, username });
                setError('Authentication error: Please log in again');
                return;
            }

            // Find partner (the other participant)
            const partnerParticipant = parts.find(p => String(p.userId) !== myId);
            setPartnerUser(partnerParticipant ? {
                _id: partnerParticipant.userId,
                username: partnerParticipant.username || 'Partner'
            } : null);

            // Ensure socket is initialized before joining
            collaborationService.initializeSocket();

            // Small delay to ensure socket connection is established
            await new Promise(resolve => setTimeout(resolve, 100));

            // Join socket room - ensure we have a valid userId
            const myJoinId = myId || '';

            if (!myJoinId) {
                setError('Unable to join session: User ID not found');
                return;
            }

            collaborationService.joinSession(sessionId, myJoinId, username);


        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const setupSocketListeners = () => {
        console.log('Setting up socket listeners for session:', sessionId);
        collaborationService.onSessionState((data) => {
            console.log('Session state received:', data);
            setConnectedUsers(data.connectedUsers || []);
        });

        collaborationService.onUserJoined((data) => {
            console.log('User joined:', data);
        });

        collaborationService.onUserLeft((data) => {
            console.log('User left:', data);
        });

        collaborationService.onCodeUpdated((data) => {
            console.log('Code updated:', data);
            setCode(data.code);
            setLanguage(data.language);
        });

        collaborationService.onChatMessage((message) => {
            console.log('Chat message received:', message);
            setChatMessages(prev => [...prev, message]);
        });

        collaborationService.onSessionEnded((data) => {
            console.log('Session ended:', data);
            alert(`Session ended by ${data.endedBy}`);
            navigate('/');
        });
    };

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            collaborationService.sendChatMessage(sessionId, newMessage);
            setNewMessage('');
        }
    };
    const handleEndSession = async () => {
        if (window.confirm('Are you sure you want to end this session?')) {
            try {
                // Wait for confirmation that session ended and all users notified
                await collaborationService.endSessionAndWait(sessionId);
                // Now safe to navigate away
                navigate('/');
            } catch (err) {
                console.error('Error ending session:', err);
                setError(err.message);
                // Navigate anyway after error to avoid stuck state
                setTimeout(() => navigate('/'), 1000);
            }
        }
    };

    const handleSaveCode = async (executionResult) => {
        try {
            const output = executionResult?.trim();
            const testCases = question?.examples || [];
            const passedCases = testCases.filter(tc => output === tc.output?.trim()).length;
            const timeTaken = Math.round((Date.now() - new Date(startTime)) / 1000)
            const sid = sessionId.replace(/^room:/, '')

            const payload = {
                sessionId: sid,
                questionId: question?.questionId,
                code: code,
                language: language,
                testCasesPassed: passedCases,
                totalTestCases: testCases.length,
                timeTaken: timeTaken,
            };

            const { data } = await userAttemptAxios.post(API.USER_ATTEMPTS, payload);
            console.log("Attempt saved in handleSaveCode:", data);

            await handleEndSession();
        } catch (err) {
            console.error("Error submitting attempt:", err);
            handleEndSession();
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <Typography>Loading collaboration session...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={3}>
                <Alert severity="error">{error}</Alert>
                <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
                    Return Home
                </Button>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                height: "100vh",
                width: "100vw",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
            }}
        >
            <TopBar
                partner={{ username: partnerUser?.username || 'Unknown', id: partnerUser?._id || '' }}
                startTime={session.startTime}
                connectedUsers={connectedUsers}
                handleEndSession={handleSaveCode}
            />

            <Box sx={{
                display: "flex",
                flexGrow: 1,
                height: "100%",
                overflow: "hidden",
                p: 2,
                gap: 2
            }}>
                <Box sx={{
                    width: { xs: "100%", md: "25%" },
                    minWidth: "250px",
                    border: "1px solid #ddd",
                    borderRadius: 2,
                    bgcolor: "white",
                    overflowY: "auto",
                    p: 2,
                }}>
                    <QuestionPanel question={question} />
                </Box>

                <Box
                    id="right-panel-container"
                    sx={{
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        overflow: "hidden",
                        minWidth: 0
                    }}
                >
                    <Box sx={{
                        flex: 1,
                        border: "1px solid #ddd",
                        borderRadius: 2,
                        bgcolor: "white",
                        p: 1,
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                        minHeight: 0,
                        marginBottom: '8px'
                    }}>
                        <CodeEditorPanel handleSaveCode={handleSaveCode} sessionId={sessionId} code={code} language={language}
                            onCodeChange={(newCode) => {
                                setCode(newCode);
                                collaborationService.sendCodeChange(sessionId, newCode, language);
                            }}
                            onLanguageChange={(newLang) => {
                                setLanguage(newLang);
                                collaborationService.sendCodeChange(sessionId, code, newLang);
                            }} />
                    </Box>

                    {/* Resize Handle */}
                    <Box
                        onMouseDown={handleResizeMouseDown}
                        sx={{
                            height: '12px',
                            cursor: 'ns-resize',
                            bgcolor: '#e0e0e0',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginY: '4px',
                            transition: 'background-color 0.2s',
                            '&:hover': {
                                bgcolor: '#1976d2',
                            },
                            '&:active': {
                                bgcolor: '#1565c0',
                            }
                        }}
                    >
                        <Box sx={{
                            width: '60px',
                            height: '4px',
                            bgcolor: '#999',
                            borderRadius: '2px'
                        }} />
                    </Box>

                    <Box sx={{
                        height: `${chatHeight}px`,
                        border: "1px solid #ddd",
                        borderRadius: 2,
                        bgcolor: "white",
                        p: 1,
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                    }}>
                        <ChatPanel
                            chatMessages={chatMessages}
                            userId={reduxUserId}
                            newMessage={newMessage}
                            setNewMessage={setNewMessage}
                            handleSendMessage={handleSendMessage}
                        />
                    </Box>
                </Box>
            </Box>
                <AiAssistantWidget
                    sessionId={sessionId}
                    userId={reduxUserId}
                    username={username}
                    questionId={question}          
                    language={language}
                    getCode={() => code}
                    chatMessages={chatMessages}
                    dockOffsetPx={120}            
                />
        </Box>
    );
}
