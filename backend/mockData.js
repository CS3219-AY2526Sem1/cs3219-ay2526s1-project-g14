// 🎭 Mock Data Store - In-memory replacement for MongoDB
// This file contains all mock data and CRUD operations

// In-memory data stores
const mockUsers = new Map();
const mockQuestions = new Map();
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

    // Sample Questions
    mockQuestions.set('q1', {
        _id: 'q1',
        questionId: 1,
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
        difficulty: 'Easy',
        topic: ['Arrays', 'Hash Table'],
        examples: [
            {
                input: 'nums = [2,7,11,15], target = 9',
                output: '[0,1]'
            },
            {
                input: 'nums = [3,2,4], target = 6', 
                output: '[1,2]'
            }
        ],
        image: null
    });

    mockQuestions.set('q2', {
        _id: 'q2',
        questionId: 2,
        title: 'Add Two Numbers',
        description: 'You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.',
        difficulty: 'Medium',
        topic: ['Linked List', 'Math'],
        examples: [
            {
                input: 'l1 = [2,4,3], l2 = [5,6,4]',
                output: '[7,0,8]'
            }
        ],
        image: null
    });

    mockQuestions.set('q3', {
        _id: 'q3',
        questionId: 3,
        title: 'Longest Substring Without Repeating Characters',
        description: 'Given a string s, find the length of the longest substring without repeating characters.',
        difficulty: 'Medium',
        topic: ['Hash Table', 'String', 'Sliding Window'],
        examples: [
            {
                input: 's = "abcabcbb"',
                output: '3'
            },
            {
                input: 's = "bbbbb"',
                output: '1'
            }
        ],
        image: null
    });

    mockQuestions.set('q4', {
        _id: 'q4',
        questionId: 4,
        title: 'Median of Two Sorted Arrays',
        description: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.',
        difficulty: 'Hard',
        topic: ['Array', 'Binary Search', 'Divide and Conquer'],
        examples: [
            {
                input: 'nums1 = [1,3], nums2 = [2]',
                output: '2.00000'
            }
        ],
        image: null
    });

    mockQuestions.set('q5', {
        _id: 'q5',
        questionId: 5,
        title: 'Valid Parentheses',
        description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
        difficulty: 'Easy',
        topic: ['String', 'Stack'],
        examples: [
            {
                input: 's = "()"',
                output: 'true'
            },
            {
                input: 's = "()[]{}"',
                output: 'true'
            },
            {
                input: 's = "(]"',
                output: 'false'
            }
        ],
        image: null
    });

    console.log('📊 Mock data initialized:', {
        users: mockUsers.size,
        questions: mockQuestions.size,
        sessions: mockSessions.size
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

// Mock Question Model
const MockQuestion = {
    find: (filter = {}) => {
        let questions = Array.from(mockQuestions.values());
        
        if (filter.topic && filter.topic.$in) {
            const topicRegex = filter.topic.$in[0];
            questions = questions.filter(q => 
                q.topic.some(t => topicRegex.test(t))
            );
        }
        
        if (filter.difficulty) {
            questions = questions.filter(q => q.difficulty === filter.difficulty);
        }
        
        return questions;
    },
    
    findById: (id) => mockQuestions.get(id) || null,
    
    distinct: (field) => {
        if (field === 'topic') {
            const allTopics = new Set();
            mockQuestions.forEach(q => {
                q.topic.forEach(t => allTopics.add(t));
            });
            return Array.from(allTopics);
        }
        return [];
    },
    
    aggregate: (pipeline) => {
        let questions = Array.from(mockQuestions.values());
        
        pipeline.forEach(stage => {
            if (stage.$match) {
                const match = stage.$match;
                if (match.difficulty) {
                    questions = questions.filter(q => q.difficulty === match.difficulty);
                }
                if (match.topic && match.topic.$in) {
                    const topicRegex = match.topic.$in[0];
                    questions = questions.filter(q => 
                        q.topic.some(t => topicRegex.test(t))
                    );
                }
            }
            
            if (stage.$sample) {
                const size = stage.$sample.size;
                questions = questions.sort(() => 0.5 - Math.random()).slice(0, size);
            }
        });
        
        return questions;
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
                        
                        if (field === 'questionId') {
                            populatedSession.questionId = mockQuestions.get(session.questionId);
                        }
                        
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
                            if (field === 'questionId') {
                                populatedSession.questionId = mockQuestions.get(session.questionId);
                            }
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
    Question: MockQuestion,
    Session: MockSession,
    
    // Direct access to data stores (for debugging)
    mockUsers,
    mockQuestions,
    mockSessions,
    mockMatchingQueue,
    
    // Utility functions
    clearAllData: () => {
        mockUsers.clear();
        mockQuestions.clear();
        mockSessions.clear();
        mockMatchingQueue.length = 0;
    },
    
    getStats: () => ({
        users: mockUsers.size,
        questions: mockQuestions.size,
        sessions: mockSessions.size,
        queueLength: mockMatchingQueue.length
    })
};
