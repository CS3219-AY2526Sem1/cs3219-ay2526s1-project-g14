// MOCK MATCHING SERVICE - For testing purposes only
// In production, this would be a separate microservice

const axios = require('axios');
const { mockMatchingQueue } = require('../mockData');

// Get socket service to notify users
let socketService = null;
try {
    socketService = require('../services/socketService');
} catch (e) {
    console.log('Socket service not available for notifications');
}

// Join matching queue (mock implementation)
exports.joinMatchingQueue = async (req, res) => {
    try {
        const { userId, difficulty, topic } = req.body;
        console.log(`🔄 User ${userId} joining queue for ${difficulty} ${topic}`);

        if (!userId || !difficulty || !topic) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields: userId, difficulty, topic' 
            });
        }

        const user = mockUsers.get(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: 'User not found' 
            });
        }

        // Check if user already in queue
        const existingIndex = mockMatchingQueue.findIndex(entry => entry.userId === userId);
        if (existingIndex !== -1) {
            return res.status(400).json({ 
                success: false, 
                error: 'User already in queue' 
            });
        }

        // Try to find a match
        console.log(`🔍 Looking for match in queue:`, mockMatchingQueue);
        const matchIndex = mockMatchingQueue.findIndex(entry => 
            entry.difficulty === difficulty && 
            entry.topic === topic &&
            entry.userId !== userId
        );

        if (matchIndex !== -1) {
            console.log(`✅ Found match at index ${matchIndex}:`, mockMatchingQueue[matchIndex]);
            // Found a match!
            const match = mockMatchingQueue.splice(matchIndex, 1)[0];
            const matchedUser = mockUsers.get(match.userId);

            // Call collaboration service to create session
            try {
                const collaborationResponse = await axios.post(`http://localhost:${process.env.PORT || 5000}/collaboration/session`, {
                    users: [
                        { userId: user.userId, username: user.username },
                        { userId: matchedUser.userId, username: matchedUser.username }
                    ],
                    difficulty,
                    topic,
                    // In production, the matching service would provide actual question data
                    questionData: {
                        questionId: `mock-${difficulty.toLowerCase()}-${topic.toLowerCase()}-${Date.now()}`,
                        title: `Sample ${difficulty} ${topic} Problem`,
                        description: `This is a sample ${difficulty.toLowerCase()} problem about ${topic.toLowerCase()}.\n\nGiven an array of integers, solve the following:\n\n1. Find the optimal solution\n2. Consider edge cases\n3. Optimize for time and space complexity\n\nConstraints:\n- 1 ≤ n ≤ 10^5\n- -10^9 ≤ arr[i] ≤ 10^9`,
                        difficulty: difficulty,
                        topic: [topic],
                        examples: [
                            {
                                input: "arr = [1, 2, 3, 4, 5]",
                                output: "Expected output based on problem requirements"
                            },
                            {
                                input: "arr = [-1, 0, 1]",
                                output: "Expected output for edge case"
                            }
                        ],
                        image: null // In production, this would be the actual image URL if available
                    }
                });

                const sessionData = collaborationResponse.data.payload;
                console.log('🎉 Session created successfully:', sessionData.sessionId);
                console.log('👥 Participants:', sessionData.participants);

                // Notify BOTH users via WebSocket about the match
                console.log('🔍 Checking WebSocket service:', !!socketService, !!socketService?.io);
                if (socketService && socketService.io) {
                    console.log('📡 Notifying both users about match via WebSocket');
                    console.log('🔌 Connected clients:', socketService.io.engine.clientsCount);
                    
                    const matchData = {
                        sessionId: sessionData.sessionId,
                        users: [
                            { userId: matchedUser.userId, username: matchedUser.username },
                            { userId: user.userId, username: user.username }
                        ]
                    };
                    
                    console.log('📤 Broadcasting match-found event:', matchData);
                    
                    // Broadcast match found to all connected clients
                    // Each client will check if it's for them based on userId
                    socketService.io.emit('match-found', matchData);
                    
                    console.log('✅ WebSocket notification sent to all connected clients');
                    
                    // Also log individual socket connections for debugging
                    socketService.io.sockets.sockets.forEach((socket, socketId) => {
                        console.log(`📡 Notifying socket: ${socketId}`);
                    });
                } else {
                    console.log('❌ WebSocket service not available, users will need to refresh');
                }

                res.status(201).json({
                    success: true,
                    payload: {
                        matched: true,
                        sessionId: sessionData.sessionId,
                        partner: matchedUser,
                        message: `Matched with ${matchedUser.username}!`
                    }
                });

            } catch (error) {
                console.error('Error creating collaboration session:', error.message);
                // Put user back in queue if session creation fails
                mockMatchingQueue.push(match);
                res.status(500).json({ 
                    success: false, 
                    error: 'Failed to create collaboration session' 
                });
            }

        } else {
            // No match found, add to queue
            mockMatchingQueue.push({
                userId,
                username: user.username,
                difficulty,
                topic,
                joinedAt: new Date()
            });

            res.status(201).json({
                success: true,
                payload: {
                    matched: false,
                    queuePosition: mockMatchingQueue.length,
                    message: 'Added to matching queue. Waiting for a partner...'
                }
            });
        }

    } catch (error) {
        console.error('Join matching queue error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// Leave matching queue
exports.leaveMatchingQueue = async (req, res) => {
    try {
        const { userId } = req.params;

        const queueIndex = mockMatchingQueue.findIndex(entry => entry.userId === userId);
        if (queueIndex === -1) {
            return res.status(404).json({ 
                success: false, 
                error: 'User not found in queue' 
            });
        }

        mockMatchingQueue.splice(queueIndex, 1);

        res.status(200).json({
            success: true,
            message: 'Successfully left matching queue'
        });

    } catch (error) {
        console.error('Leave matching queue error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// Get queue status (for debugging)
exports.getQueueStatus = async (req, res) => {
    res.status(200).json({
        success: true,
        payload: {
            queueLength: mockMatchingQueue.length,
            queue: mockMatchingQueue
        }
    });
};
