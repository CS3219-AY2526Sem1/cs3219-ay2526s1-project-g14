const { Server } = require('socket.io');
const Session = require('../model/sessionModel');

class SocketService {
    constructor() {
        this.io = null;
        this.sessions = new Map(); // sessionId -> Set of socketIds
    }

    initialize(server) {
        this.io = new Server(server, {
            cors: {
                origin: ["http://localhost:3000", "http://localhost:3001", process.env.FRONTEND_URL].filter(Boolean),
                methods: ["GET", "POST"]
            }
        });

        this.io.on('connection', (socket) => {
            console.log(`User connected: ${socket.id}`);

            // Join a collaboration session
            socket.on('join-session', async (data) => {
                try {
                    const { sessionId, userId, username } = data;
                    
                    // Validate session exists
                    const session = await Session.findOne({ sessionId });
                    if (!session) {
                        socket.emit('error', { message: 'Session not found' });
                        return;
                    }

                    // Check if user is participant
                    const isParticipant = session.participants.some(p => p.userId.toString() === userId);
                    if (!isParticipant) {
                        socket.emit('error', { message: 'Not authorized for this session' });
                        return;
                    }

                    // Ensure session has exactly 2 participants
                    if (session.participants.length !== 2) {
                        socket.emit('error', { message: 'Invalid session: must have exactly 2 participants' });
                        return;
                    }

                    // Join socket room
                    socket.join(sessionId);
                    socket.sessionId = sessionId;
                    socket.userId = userId;
                    socket.username = username;

                    // Track session participants
                    if (!this.sessions.has(sessionId)) {
                        this.sessions.set(sessionId, new Set());
                    }
                    this.sessions.get(sessionId).add(socket.id);

                    // Notify others in session
                    socket.to(sessionId).emit('user-joined', {
                        userId,
                        username,
                        message: `${username} joined the session`
                    });

                    // Send current session state
                    socket.emit('session-state', {
                        session,
                        connectedUsers: Array.from(this.sessions.get(sessionId)).length
                    });

                } catch (error) {
                    console.error('Join session error:', error);
                    socket.emit('error', { message: 'Failed to join session' });
                }
            });

            // Handle code changes
            socket.on('code-change', async (data) => {
                try {
                    const { sessionId, code, language } = data;
                    console.log('💻 Received code change:', { sessionId, codeLength: code.length, language, from: socket.username });
                    
                    if (socket.sessionId !== sessionId) {
                        console.log('❌ Code change rejected - not in session');
                        socket.emit('error', { message: 'Not in this session' });
                        return;
                    }

                    // Update session in database
                    await Session.findOneAndUpdate(
                        { sessionId },
                        { code, language, status: 'in_progress' }
                    );

                    // Broadcast to other participants
                    console.log('📡 Broadcasting code update to room:', sessionId);
                    socket.to(sessionId).emit('code-updated', {
                        code,
                        language,
                        updatedBy: socket.username
                    });

                } catch (error) {
                    console.error('Code change error:', error);
                    socket.emit('error', { message: 'Failed to update code' });
                }
            });

            // Handle chat messages
            socket.on('chat-message', async (data) => {
                try {
                    const { sessionId, message } = data;
                    console.log('💬 Received chat message:', { sessionId, message, from: socket.username });
                    
                    if (socket.sessionId !== sessionId) {
                        console.log('❌ Chat message rejected - not in session');
                        socket.emit('error', { message: 'Not in this session' });
                        return;
                    }

                    const chatMessage = {
                        userId: socket.userId,
                        username: socket.username,
                        message,
                        timestamp: new Date()
                    };

                    // Save to database
                    await Session.findOneAndUpdate(
                        { sessionId },
                        { $push: { chatHistory: chatMessage } }
                    );

                    // Broadcast to all participants (including sender)
                    console.log('📡 Broadcasting chat message to room:', sessionId);
                    this.io.to(sessionId).emit('chat-message', chatMessage);

                } catch (error) {
                    console.error('Chat message error:', error);
                    socket.emit('error', { message: 'Failed to send message' });
                }
            });

            // Handle cursor position updates
            socket.on('cursor-position', (data) => {
                const { sessionId, position } = data;
                
                if (socket.sessionId !== sessionId) return;

                socket.to(sessionId).emit('cursor-updated', {
                    userId: socket.userId,
                    username: socket.username,
                    position
                });
            });

            // Handle disconnection
            socket.on('disconnect', () => {
                console.log(`User disconnected: ${socket.id}`);
                
                if (socket.sessionId) {
                    // Remove from session tracking
                    const sessionSockets = this.sessions.get(socket.sessionId);
                    if (sessionSockets) {
                        sessionSockets.delete(socket.id);
                        if (sessionSockets.size === 0) {
                            this.sessions.delete(socket.sessionId);
                        }
                    }

                    // Notify others in session
                    socket.to(socket.sessionId).emit('user-left', {
                        userId: socket.userId,
                        username: socket.username,
                        message: `${socket.username} left the session`
                    });
                }
            });

            // Handle session end
            socket.on('end-session', async (data) => {
                try {
                    const { sessionId } = data;
                    
                    if (socket.sessionId !== sessionId) {
                        socket.emit('error', { message: 'Not in this session' });
                        return;
                    }

                    // Update session status
                    await Session.findOneAndUpdate(
                        { sessionId },
                        { status: 'completed', endTime: new Date() }
                    );

                    // Notify all participants
                    this.io.to(sessionId).emit('session-ended', {
                        endedBy: socket.username,
                        message: 'Session has been ended'
                    });

                    // Clean up
                    this.sessions.delete(sessionId);

                } catch (error) {
                    console.error('End session error:', error);
                    socket.emit('error', { message: 'Failed to end session' });
                }
            });
        });

        return this.io;
    }

    // Method to notify matched users
    notifyMatch(sessionId, participants) {
        participants.forEach(participant => {
            this.io.to(participant.userId.toString()).emit('match-found', {
                sessionId,
                partner: participants.find(p => p.userId !== participant.userId)
            });
        });
    }
}

module.exports = new SocketService();
