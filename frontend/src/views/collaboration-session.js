import { useState, useEffect } from 'react';
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
    
    // code editor state
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    
    // chat state
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    
    // connection state
    const [connectedUsers, setConnectedUsers] = useState([]);
    const [partnerUser, setPartnerUser] = useState(null);
    
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
            setPartnerUser(partnerParticipant ? { _id: partnerParticipant.userId, username: 'Partner' } : null);

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
                await collaborationService.endSession(sessionId);
                collaborationService.endSessionSocket(sessionId);
                navigate('/');
            } catch (err) {
                setError(err.message);
            }
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
                handleEndSession={handleEndSession}
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
                    width: { xs: "100%", md: "30%" },
                    border: "1px solid #ddd",
                    borderRadius: 2,
                    bgcolor: "white",
                    overflowY: "auto",
                    p: 2,
                }}>
                    <QuestionPanel question={question} />
                </Box>

                <Box sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    overflow: "hidden",
                    gap: 2
                }}>
                    <Box sx={{
                        flex: 6, // 60%
                        border: "1px solid #ddd",
                        borderRadius: 2,
                        bgcolor: "white",
                        p: 1,
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",rBottom: "1px solid #eee"
                    }}>
                        <CodeEditorPanel sessionId={sessionId} code={code} language={language} 
                          onCodeChange={(newCode) => {
                            collaborationService.sendCodeChange(sessionId, newCode, language);
                          }}
                          onLanguageChange={(newLang) => {
                            setLanguage(newLang);
                            collaborationService.sendCodeChange(sessionId, code, newLang);
                          }}/>
                    </Box>

                    <Box sx={{
                        flex: 4, // 40%
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
        </Box>
    );
}
