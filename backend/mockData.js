// 🎭 Mock Data Store - In-memory replacement for MongoDB
// This file contains all mock data and CRUD operations

// In-memory data stores
const mockSessions = new Map();
const mockMatchingQueue = [];

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
    // Mock models (drop-in replacements)
    Session: MockSession,
    
    // Direct access to data stores (for debugging)
    mockSessions,
    mockMatchingQueue,
    
    // Utility functions
    clearAllData: () => {
        mockSessions.clear();
        mockMatchingQueue.length = 0;
    },
    
    getStats: () => ({
        sessions: mockSessions.size,
        queueLength: mockMatchingQueue.length
    })
};
