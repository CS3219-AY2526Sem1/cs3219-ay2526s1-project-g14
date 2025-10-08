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
    const userId = useSelector((state) => state.auth.id);

    // Session state
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [question, setQuestion] = useState(null);
    
    // Code editor state
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    
    // Chat state
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    
    // Connection state
    const [connectedUsers, setConnectedUsers] = useState([]);
    const [partner, setPartner] = useState(null);
    
    useEffect(() => {
        loadSession();
        setupSocketListeners();
        
        return () => {
            collaborationService.disconnect();
        };
    }, [sessionId]);

    const loadSession = async () => {
        try {
            const response = await collaborationService.getSession(sessionId);
            const sessionData = response.payload;
            
            setSession(sessionData);
            console.log("sessionData", sessionData)
            setQuestion(sessionData.questionId)
            setCode(sessionData.code || '');
            setLanguage(sessionData.language || 'javascript');
            setChatMessages(sessionData.chatHistory || []);
            
            // Find partner
            const partnerData = sessionData.participants.find(p => p.userId._id !== userId);
            setPartner(partnerData.userId._id);
            
            // Join socket room
            collaborationService.joinSession(sessionId, userId, username);
            
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const setupSocketListeners = () => {
        collaborationService.onSessionState((data) => {
            console.log('Session state received:', data);
            setConnectedUsers(data.connectedUsers || 0);
        });

        collaborationService.onUserJoined((data) => {
            console.log('User joined:', data);
        });

        collaborationService.onUserLeft((data) => {
            console.log('User left:', data);
        });

        collaborationService.onCodeUpdated((data) => {
            setCode(data.code);
            setLanguage(data.language);
        });

        collaborationService.onChatMessage((message) => {
            setChatMessages(prev => [...prev, message]);
        });

        collaborationService.onSessionEnded((data) => {
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
                partner={partner}
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
                        <CodeEditorPanel sessionId={sessionId} code={code} language={language} />
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
                            userId={userId}
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
