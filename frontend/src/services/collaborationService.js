import axios from 'axios';
import { io } from 'socket.io-client';
import { MATCHING_API } from '../constants/api';
import backendAxios from '../config/axios';

// Create a separate axios instance for collaboration service
const collaborationAxios = axios.create({
    baseURL: process.env.REACT_APP_COLLABORATION_URL || 'http://localhost:5051',
    timeout: 60000,
    headers: {}
});

// Add token to collaboration requests
collaborationAxios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('authToken') ||
                  JSON.parse(localStorage.getItem('user') || '{}')?.token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

class CollaborationService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
    }

    // Initialize WebSocket connection
    initializeSocket() {
        if (!this.socket) {
            this.socket = io(process.env.REACT_APP_COLLABORATION_URL || 'http://localhost:5051');
            
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
            const { data } = await backendAxios.post(MATCHING_API.START, { topic, difficulty });
            return data; // { requestId, status, ... }
          }

        async leaveQueue(requestId) {
            try {
              const { data } = await backendAxios.delete(MATCHING_API.CANCEL(requestId));
              return data;
            } catch (error) {
              throw new Error(error.response?.data?.error || 'Failed to cancel match');
            }
          }

          async getStatus(requestId) {
            try {
              const { data } = await backendAxios.get(MATCHING_API.STATUS(requestId));
              return data; // { status, roomId, partnerUsername, ... }
            } catch (error) {
              throw new Error(error.response?.data?.error || 'Failed to get matching status');
            }
          }

    // Create collaboration session (microservice API)
    async createSession(payload) {
        try {
            const response = await collaborationAxios.post('/collaboration/session', payload);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to create session');
        }
    }

    async getSession(sessionId) {
        try {
            const response = await collaborationAxios.get(`/collaboration/session/${sessionId.replace(/^room:/, '')}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to get session');
        }
    }

    async updateSessionCode(sessionId, code, language) {
        try {
            const response = await collaborationAxios.put(`/collaboration/session/${sessionId}/code`, {
                code,
                language
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to update code');
        }
    }

    async endSession(sessionId) {
        try {
            const response = await collaborationAxios.put(`/collaboration/session/${sessionId.replace(/^room:/, '')}/end`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to end session');
        }
    }

    // End session and wait for confirmation before proceeding
    async endSessionAndWait(sessionId) {
        return new Promise((resolve, reject) => {
            if (!this.socket || !this.isConnected) {
                // Fallback to REST API only if socket not available
                this.endSession(sessionId)
                    .then(resolve)
                    .catch(reject);
                return;
            }

            const timeout = setTimeout(() => {
                this.socket.off('session-ended-confirmed', confirmHandler);
                reject(new Error('Session end confirmation timeout'));
            }, 5000);

            const confirmHandler = () => {
                clearTimeout(timeout);
                this.socket.off('session-ended-confirmed', confirmHandler);
                console.log('✅ Session end confirmed by server');
                resolve();
            };

            // Listen for confirmation
            this.socket.once('session-ended-confirmed', confirmHandler);

            // Call REST API to end session (backend will emit events)
            this.endSession(sessionId)
                .catch((error) => {
                    clearTimeout(timeout);
                    this.socket.off('session-ended-confirmed', confirmHandler);
                    reject(error);
                });
        });
    }

    async getUserSession(userId) {
        try {
            const response = await collaborationAxios.get(`/collaboration/user/${userId}/session`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to get user session');
        }
    }

    // Socket methods for real-time collaboration
    joinSession(sessionId, userId, username) {
        if (!this.socket) this.initializeSocket();
        console.log('Attempting to join session:', { sessionId, userId, username, connected: this.isConnected });
        this.socket.emit('join-session', { sessionId, userId, username });
    }

    sendCodeChange(sessionId, code, language) {
        console.log('Sending code change:', { sessionId, connected: this.isConnected, codeLength: code.length });
        if (this.socket && this.isConnected) {
            const norm = String(sessionId).replace(/^room:/, '');
            this.socket.emit('code-change', { sessionId: norm, code, language });
        } else {
            console.warn('⚠️ Cannot send code change - socket not connected');
        }
    }

    sendChatMessage(sessionId, message) {
        console.log('Sending chat message:', { sessionId, connected: this.isConnected, message });
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


    // Event listeners
    onMatchFound(callback) {
        if (!this.socket) this.initializeSocket();
        this.socket.on('match-found', (data) => {
            console.log('WebSocket match-found event received by socket:', this.socket.id, 'Data:', data);
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
        console.log('Setting up code-updated listener');
        this.socket.on('code-updated', callback);
    }

    onChatMessage(callback) {
        if (!this.socket) this.initializeSocket();
        console.log('Setting up chat-message listener');
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
