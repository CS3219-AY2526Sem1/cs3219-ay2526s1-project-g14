/**
 * AI Usage
 * This file contains code enhanced with GitHub Copilot assistance.
 * Specific improvements: connection state tracking, broadcasting logic, and comments.
 * See /ai-usage-log.md for detailed attribution and modifications.
 * Date: 2025-10-25
 */

const { Server } = require('socket.io');
const Session = require('../models/sessionModel');

class SocketService {
    constructor() {
        this.io = null;
        this.sessions = new Map();
    }

    initialize(server) {
        this.io = new Server(server, {
            cors: {
                origin: process.env.FRONTEND_URL || "http://localhost:3000",
                methods: ["GET", "POST"]
            }
        });

        this.io.on('connection', (socket) => {
            console.log(`User connected: ${socket.id}`);

            socket.on('join-session', async (data) => {
                try {
                    const { sessionId, userId, username } = data;
                    console.log('User attempting to join session:', { sessionId, userId, username });
                    
                    const session = await Session.findOne({ sessionId });
                    if (!session) {
                        console.log('Session not found:', sessionId);
                        socket.emit('error', { message: 'Session not found' });
                        return;
                    }

                    const isParticipant = session.participants.some(p => p.userId.toString() === String(userId));
                    if (!isParticipant) {
                        console.log('User not authorized for session:', { userId, sessionId });
                        socket.emit('error', { message: 'Not authorized for this session' });
                        return;
                    }

                    socket.join(sessionId);
                    socket.sessionId = sessionId;
                    socket.userId = userId;
                    socket.username = username;
                    console.log(`User ${username} joined session ${sessionId}, socket.sessionId set to:`, socket.sessionId);

                    if (!this.sessions.has(sessionId)) {
                        this.sessions.set(sessionId, new Set());
                    }
                    this.sessions.get(sessionId).add(socket.id);

                    socket.to(sessionId).emit('user-joined', {
                        userId,
                        username,
                        message: `${username} joined the session`
                    });

                    // Get all connected users in this session
                    const sessionSockets = this.sessions.get(sessionId);
                    const connectedUsers = [];
                    
                    if (sessionSockets) {
                        sessionSockets.forEach(socketId => {
                            const sock = this.io.sockets.sockets.get(socketId);
                            if (sock && sock.userId && sock.username) {
                                connectedUsers.push({
                                    id: String(sock.userId),
                                    username: sock.username
                                });
                            }
                        });
                    }

                    console.log(`Session ${sessionId}: ${connectedUsers.length} users connected`, connectedUsers);

                    // Broadcast updated connection state to ALL users in the session (including sender)
                    this.io.in(sessionId).emit('session-state', {
                        session,
                        connectedUsers
                    });

                } catch (error) {
                    console.error('Join session error:', error);
                    socket.emit('error', { message: 'Failed to join session' });
                }
            });

            socket.on('code-change', async (data) => {
                try {
                    const { sessionId, code, language } = data;
                    console.log('Received code change:', { sessionId, codeLength: code.length, language, from: socket.username });
                    
                    if (socket.sessionId !== sessionId) {
                        console.log('Code change rejected - not in session');
                        socket.emit('error', { message: 'Not in this session' });
                        return;
                    }

                    await Session.findOneAndUpdate(
                        { sessionId },
                        { code, language, status: 'in_progress' }
                    );

                    console.log('Broadcasting code update to room:', sessionId);
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

            socket.on('chat-message', async (data) => {
                try {
                    const { sessionId, message } = data;
                    console.log('Received chat message:', { sessionId, message, from: socket.username });
                    console.log('Session ID comparison:', { 
                        received: sessionId, 
                        stored: socket.sessionId, 
                        match: socket.sessionId === sessionId 
                    });
                    
                    if (socket.sessionId !== sessionId) {
                        console.log('Chat message rejected - not in session');
                        socket.emit('error', { message: 'Not in this session' });
                        return;
                    }

                    const chatMessage = {
                        userId: socket.userId,
                        username: socket.username,
                        message,
                        timestamp: new Date()
                    };

                    await Session.findOneAndUpdate(
                        { sessionId },
                        { $push: { chatHistory: chatMessage } }
                    );

                    console.log('Broadcasting chat message to room:', sessionId);
                    this.io.to(sessionId).emit('chat-message', chatMessage);

                } catch (error) {
                    console.error('Chat message error:', error);
                    socket.emit('error', { message: 'Failed to send message' });
                }
            });

            socket.on('disconnect', () => {
                console.log(`User disconnected: ${socket.id} (${socket.username})`);
                
                if (socket.sessionId) {
                    const sessionSockets = this.sessions.get(socket.sessionId);
                    if (sessionSockets) {
                        sessionSockets.delete(socket.id);
                        if (sessionSockets.size === 0) {
                            this.sessions.delete(socket.sessionId);
                        }
                    }

                    // Notify partner that user disconnected (but session is still active)
                    socket.to(socket.sessionId).emit('user-left', {
                        userId: socket.userId,
                        username: socket.username,
                        message: `${socket.username} disconnected`
                    });

                    // Broadcast updated connection state after user leaves
                    const connectedUsers = [];
                    if (sessionSockets) {
                        sessionSockets.forEach(socketId => {
                            const sock = this.io.sockets.sockets.get(socketId);
                            if (sock && sock.userId && sock.username) {
                                connectedUsers.push({
                                    id: String(sock.userId),
                                    username: sock.username
                                });
                            }
                        });
                    }
                    
                    this.io.to(socket.sessionId).emit('session-state', {
                        connectedUsers
                    });
                }
            });
        });

        return this.io;
    }
}

module.exports = new SocketService();

