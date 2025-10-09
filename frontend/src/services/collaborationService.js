import axios from '../config/axios';
import { io } from 'socket.io-client';
import { MATCHING_API } from '../constants/api';

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

    async joinQueue({ topic, difficulty }) {
        try {
          const { data } = await axios.post(MATCHING_API.START, { topic, difficulty });
          return data; // { requestId, status, ... }
        } catch (error) {
          throw new Error(error.response?.data?.error || 'Failed to start matching');
        }
      }

    async leaveQueue(requestId) {
        try {
          const { data } = await axios.delete(MATCHING_API.CANCEL(requestId));
          return data;
        } catch (error) {
          throw new Error(error.response?.data?.error || 'Failed to cancel match');
        }
      }
    
      async getStatus(requestId) {
        try {
          const { data } = await axios.get(MATCHING_API.STATUS(requestId));
          return data; // { status, roomId, partnerUsername, ... }
        } catch (error) {
          throw new Error(error.response?.data?.error || 'Failed to get matching status');
        }
      }

    // Create collaboration session (microservice API)
    async createSession(payload) {
        try {
            const response = await axios.post('/collaboration/session', payload);
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
        console.log('🔌 Attempting to join session:', { sessionId, userId, username, connected: this.isConnected });
        this.socket.emit('join-session', { sessionId, userId, username });
    }

    sendCodeChange(sessionId, code, language) {
        console.log('💻 Sending code change:', { sessionId, connected: this.isConnected, codeLength: code.length });
        if (this.socket && this.isConnected) {
            this.socket.emit('code-change', { sessionId, code, language });
        } else {
            console.warn('⚠️ Cannot send code change - socket not connected');
        }
    }

    sendChatMessage(sessionId, message) {
        console.log('💬 Sending chat message:', { sessionId, connected: this.isConnected, message });
        if (this.socket && this.isConnected) {
            this.socket.emit('chat-message', { sessionId, message });
        } else {
            console.warn('⚠️ Cannot send chat message - socket not connected');
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
        console.log('📡 Setting up code-updated listener');
        this.socket.on('code-updated', callback);
    }

    onChatMessage(callback) {
        if (!this.socket) this.initializeSocket();
        console.log('📡 Setting up chat-message listener');
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
