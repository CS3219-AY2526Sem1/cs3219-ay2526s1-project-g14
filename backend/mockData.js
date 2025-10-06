// 🎭 Mock Data Store - In-memory replacement for MongoDB
// This file contains all mock data and CRUD operations

// In-memory data stores
const mockUsers = new Map();
const mockSessions = new Map();
const mockMatchingQueue = [];

// Initialize with sample data
function initializeMockData() {
    // Sample Users with emails
    mockUsers.set('user123', {
        _id: 'user123',
        userId: 'user123',
        username: 'Alice',
        email: 'alice@test.com'
    });
    
    mockUsers.set('user456', {
        _id: 'user456', 
        userId: 'user456',
        username: 'Bob',
        email: 'bob@test.com'
    });

    mockUsers.set('user789', {
        _id: 'user789',
        userId: 'user789', 
        username: 'Charlie',
        email: 'charlie@test.com'
    });
}

// Mock User Model
const MockUser = {
    find: () => Array.from(mockUsers.values()),
    findById: (id) => mockUsers.get(id) || null,
    create: (userData) => {
        const user = {
            _id: userData.userId || Date.now().toString(),
            userId: userData.userId || Date.now().toString(),
            username: userData.username,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        mockUsers.set(user.userId, user);
        return user;
    }
};

// Mock Session Model
const MockSession = {
    findOne: (filter) => {
        console.log('🔍 Session.findOne called with filter:', filter);
        console.log('📊 Available sessions:', Array.from(mockSessions.keys()));
        
        for (const session of mockSessions.values()) {
            if (filter.sessionId && session.sessionId === filter.sessionId) {
                console.log('✅ Found session:', session.sessionId);
                // Create a chainable populate object
                const populateChain = {
                    ...session,
                    populate: (field, select) => {
                        let populatedSession = { ...session };
                        
                        // if (field === 'questionId') {
                        //     populatedSession.questionId = mockQuestions.get(session.questionId);
                        // }
                        
                        // Return another populate chain for chaining
                        return {
                            ...populatedSession,
                            populate: (field2, select2) => {
                                // Handle second populate call
                                if (field2 === 'participants.userId') {
                                    // For participants, we already have the data
                                    return populatedSession;
                                }
                                return populatedSession;
                            }
                        };
                    }
                };
                return populateChain;
            }
            
            if (filter['participants.userId'] && filter.status) {
                const hasUser = session.participants.some(p => p.userId === filter['participants.userId']);
                const statusMatch = filter.status.$in ? filter.status.$in.includes(session.status) : session.status === filter.status;
                if (hasUser && statusMatch) {
                    const populateChain = {
                        ...session,
                        populate: (field) => {
                            let populatedSession = { ...session };
                            // if (field === 'questionId') {
                            //     populatedSession.questionId = mockQuestions.get(session.questionId);
                            // }
                            return populatedSession;
                        }
                    };
                    return populateChain;
                }
            }
        }
        return null;
    },
    
    findOneAndUpdate: (filter, update, options = {}) => {
        for (const [id, session] of mockSessions.entries()) {
            if (filter.sessionId && session.sessionId === filter.sessionId) {
                const updatedSession = { ...session, ...update, updatedAt: new Date() };
                mockSessions.set(id, updatedSession);
                return options.new ? updatedSession : session;
            }
        }
        return null;
    },
    
    create: (sessionData) => {
        const session = {
            _id: Date.now().toString(),
            sessionId: sessionData.sessionId || `session_${Date.now()}`,
            participants: sessionData.participants || [],
            questionId: sessionData.questionId,
            difficulty: sessionData.difficulty,
            topic: sessionData.topic,
            status: sessionData.status || 'active',
            code: sessionData.code || '',
            language: sessionData.language || 'javascript',
            startTime: sessionData.startTime || new Date(),
            endTime: sessionData.endTime || null,
            chatHistory: sessionData.chatHistory || [],
            questionMetadata: sessionData.questionMetadata || {},
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        mockSessions.set(session._id, session);
        return session;
    }
};

// Export everything
module.exports = {
    // Initialize function
    initializeMockData,
    
    // Mock models (drop-in replacements)
    User: MockUser,
    Session: MockSession,
    
    // Direct access to data stores (for debugging)
    mockUsers,
    mockSessions,
    mockMatchingQueue,
    
    // Utility functions
    clearAllData: () => {
        mockUsers.clear();
        mockSessions.clear();
        mockMatchingQueue.length = 0;
    },
    
    getStats: () => ({
        users: mockUsers.size,
        sessions: mockSessions.size,
        queueLength: mockMatchingQueue.length
    })
};
