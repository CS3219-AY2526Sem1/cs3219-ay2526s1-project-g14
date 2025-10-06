import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Button,
    TextField,
    Alert,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Tabs,
    Tab
} from '@mui/material';
import {
    Send as SendIcon,
    ExitToApp as ExitIcon,
    Person as PersonIcon,
    QuestionAnswer as QuestionIcon,
    Code as CodeIcon
} from '@mui/icons-material';
import collaborationService from '../services/collaborationService';
import QuestionDisplay from '../components/collaboration/QuestionDisplay';

export default function CollaborationSession() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    
    // Get user from session storage (set by UserSelector)
    const getCurrentUser = () => {
        const storedUser = sessionStorage.getItem('currentUser');
        if (storedUser) {
            return JSON.parse(storedUser);
        }
        // Fallback if no user selected
        return { id: "user123", username: "Guest" };
    };
    
    const currentUser = getCurrentUser();

    // Session state
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Code editor state
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    
    // Chat state
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    
    // Connection state
    const [connectedUsers, setConnectedUsers] = useState([]);
    const [partner, setPartner] = useState(null);
    
    // UI state
    const [leftPanelTab, setLeftPanelTab] = useState(0); // 0: Question, 1: Code

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
            setCode(sessionData.code || '');
            setLanguage(sessionData.language || 'javascript');
            setChatMessages(sessionData.chatHistory || []);
            
            // Find partner
            const partnerData = sessionData.participants.find(p => p.userId !== currentUser.userId);
            setPartner(partnerData);
            
            // Join socket room
            collaborationService.joinSession(sessionId, currentUser.userId, currentUser.username);
            
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

    const handleCodeChange = (newCode) => {
        setCode(newCode);
        // Debounce code updates to avoid too many socket emissions
        clearTimeout(window.codeUpdateTimeout);
        window.codeUpdateTimeout = setTimeout(() => {
            collaborationService.sendCodeChange(sessionId, newCode, language);
        }, 500);
    };

    const handleLanguageChange = (newLanguage) => {
        setLanguage(newLanguage);
        collaborationService.sendCodeChange(sessionId, code, newLanguage);
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
        <Box p={3} sx={{ height: 'calc(100vh - 100px)' }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#0091f3' }}>
                    Collaboration Session
                </Typography>
                <Box display="flex" gap={2} alignItems="center">
                    <Chip 
                        icon={<PersonIcon />} 
                        label={`${connectedUsers} connected`} 
                        color="primary" 
                        variant="outlined"
                    />
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<ExitIcon />}
                        onClick={handleEndSession}
                    >
                        End Session
                    </Button>
                </Box>
            </Box>

            {/* Session Info */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>
                            {session?.questionId?.title || 'Loading question...'}
                        </Typography>
                        <Box display="flex" gap={1}>
                            <Chip label={session?.difficulty} color="primary" size="small" />
                            <Chip label={session?.topic} color="secondary" size="small" />
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="textSecondary">
                            Partner: {partner?.username || 'Waiting...'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Session ID: {sessionId}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            <Grid container spacing={2} sx={{ height: 'calc(100% - 140px)' }}>
                {/* Left Panel - Question & Code */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {/* Tab Navigation */}
                        <Box sx={{ borderBottom: '1px solid #e0e0e0' }}>
                            <Tabs 
                                value={leftPanelTab} 
                                onChange={(e, newValue) => setLeftPanelTab(newValue)}
                                sx={{ minHeight: 48 }}
                            >
                                <Tab 
                                    icon={<QuestionIcon />} 
                                    label="Problem" 
                                    iconPosition="start"
                                    sx={{ minHeight: 48 }}
                                />
                                <Tab 
                                    icon={<CodeIcon />} 
                                    label="Code Editor" 
                                    iconPosition="start"
                                    sx={{ minHeight: 48 }}
                                />
                            </Tabs>
                        </Box>

                        {/* Tab Content */}
                        <Box sx={{ flex: 1, overflow: 'hidden' }}>
                            {leftPanelTab === 0 && (
                                /* Question Tab */
                                <QuestionDisplay
                                    question={session?.questionId}
                                    questionMetadata={session?.questionMetadata}
                                    difficulty={session?.difficulty}
                                    topics={session?.questionMetadata?.topics || [session?.topic]}
                                />
                            )}
                            
                            {leftPanelTab === 1 && (
                                /* Code Editor Tab */
                                <Box sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column' }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Typography variant="h6">Code Editor</Typography>
                                        <FormControl size="small" sx={{ minWidth: 120 }}>
                                            <InputLabel>Language</InputLabel>
                                            <Select
                                                value={language}
                                                label="Language"
                                                onChange={(e) => handleLanguageChange(e.target.value)}
                                            >
                                                <MenuItem value="javascript">JavaScript</MenuItem>
                                                <MenuItem value="python">Python</MenuItem>
                                                <MenuItem value="java">Java</MenuItem>
                                                <MenuItem value="cpp">C++</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>
                                    
                                    <TextField
                                        multiline
                                        fullWidth
                                        rows={25}
                                        value={code}
                                        onChange={(e) => handleCodeChange(e.target.value)}
                                        placeholder="Start coding here..."
                                        variant="outlined"
                                        sx={{
                                            flex: 1,
                                            '& .MuiInputBase-root': {
                                                fontFamily: 'monospace',
                                                fontSize: '14px',
                                                height: '100%'
                                            },
                                            '& .MuiInputBase-input': {
                                                height: '100% !important',
                                                overflow: 'auto !important'
                                            }
                                        }}
                                    />
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* Right Panel - Chat */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                            <Typography variant="h6">Chat</Typography>
                        </Box>
                        
                        {/* Chat Messages */}
                        <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
                            <List dense>
                                {chatMessages.map((message, index) => (
                                    <ListItem key={index} sx={{ 
                                        flexDirection: 'column', 
                                        alignItems: message.userId === currentUser.userId ? 'flex-end' : 'flex-start',
                                        py: 0.5
                                    }}>
                                        <Box sx={{
                                            backgroundColor: message.userId === currentUser.userId ? '#0091f3' : '#f5f5f5',
                                            color: message.userId === currentUser.userId ? 'white' : 'black',
                                            borderRadius: 2,
                                            px: 2,
                                            py: 1,
                                            maxWidth: '80%'
                                        }}>
                                            <Typography variant="caption" display="block">
                                                {message.username}
                                            </Typography>
                                            <Typography variant="body2">
                                                {message.message}
                                            </Typography>
                                        </Box>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>

                        {/* Chat Input */}
                        <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                            <Box display="flex" gap={1}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSendMessage();
                                        }
                                    }}
                                />
                                <IconButton 
                                    color="primary" 
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim()}
                                >
                                    <SendIcon />
                                </IconButton>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
