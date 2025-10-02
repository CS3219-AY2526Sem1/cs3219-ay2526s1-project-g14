import axios from '../config/axios';
import { io } from 'socket.io-client';

class CollaborationService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
    }

    // Initialize WebSocket connection
    initializeSocket() {
        if (!this.socket) {
            this.socket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5050');
            
            this.socket.on('connect', () => {
                console.log('🔌 Connected to collaboration service, socket ID:', this.socket.id);
                this.isConnected = true;
            });

            this.socket.on('disconnect', () => {
                console.log('Disconnected from collaboration service');
                this.isConnected = false;
            });

            this.socket.on('error', (error) => {
                console.error('Socket error:', error);
            });
        }
        return this.socket;
    }

    // Join matching queue (calls external matching service)
    async joinQueue(userId, username, difficulty, topic) {
        try {
            // In production, this would call the external matching service
            // For now, using mock matching service
            const response = await axios.post('/matching/queue', {
                userId,
                difficulty,
                topic
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to join queue');
        }
    }

    // Leave matching queue
    async leaveQueue(userId) {
        try {
            const response = await axios.delete(`/matching/queue/${userId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to leave queue');
        }
    }

    // Create collaboration session (microservice API)
    async createSession(users, difficulty, topic, questionId = null) {
        try {
            const response = await axios.post('/collaboration/session', {
                users,
                difficulty,
                topic,
                questionId
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to create session');
        }
    }

    // Get session details
    async getSession(sessionId) {
        try {
            const response = await axios.get(`/collaboration/session/${sessionId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to get session');
        }
    }

    // Update session code
    async updateSessionCode(sessionId, code, language) {
        try {
            const response = await axios.put(`/collaboration/session/${sessionId}/code`, {
                code,
                language
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to update code');
        }
    }

    // End session
    async endSession(sessionId) {
        try {
            const response = await axios.put(`/collaboration/session/${sessionId}/end`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to end session');
        }
    }

    // Get user's active session
    async getUserSession(userId) {
        try {
            const response = await axios.get(`/collaboration/user/${userId}/session`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to get user session');
        }
    }

    // Socket methods for real-time collaboration
    joinSession(sessionId, userId, username) {
        if (!this.socket) this.initializeSocket();
        this.socket.emit('join-session', { sessionId, userId, username });
    }

    sendCodeChange(sessionId, code, language) {
        if (this.socket && this.isConnected) {
            this.socket.emit('code-change', { sessionId, code, language });
        }
    }

    sendChatMessage(sessionId, message) {
        if (this.socket && this.isConnected) {
            this.socket.emit('chat-message', { sessionId, message });
        }
    }

    sendCursorPosition(sessionId, position) {
        if (this.socket && this.isConnected) {
            this.socket.emit('cursor-position', { sessionId, position });
        }
    }

    endSessionSocket(sessionId) {
        if (this.socket && this.isConnected) {
            this.socket.emit('end-session', { sessionId });
        }
    }

    // Event listeners
    onMatchFound(callback) {
        if (!this.socket) this.initializeSocket();
        this.socket.on('match-found', (data) => {
            console.log('🔔 WebSocket match-found event received by socket:', this.socket.id, 'Data:', data);
            callback(data);
        });
    }

    onUserJoined(callback) {
        if (!this.socket) this.initializeSocket();
        this.socket.on('user-joined', callback);
    }

    onUserLeft(callback) {
        if (!this.socket) this.initializeSocket();
        this.socket.on('user-left', callback);
    }

    onCodeUpdated(callback) {
        if (!this.socket) this.initializeSocket();
        this.socket.on('code-updated', callback);
    }

    onChatMessage(callback) {
        if (!this.socket) this.initializeSocket();
        this.socket.on('chat-message', callback);
    }

    onCursorUpdated(callback) {
        if (!this.socket) this.initializeSocket();
        this.socket.on('cursor-updated', callback);
    }

    onSessionEnded(callback) {
        if (!this.socket) this.initializeSocket();
        this.socket.on('session-ended', callback);
    }

    onSessionState(callback) {
        if (!this.socket) this.initializeSocket();
        this.socket.on('session-state', callback);
    }

    // Cleanup
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }
}

export default new CollaborationService();
