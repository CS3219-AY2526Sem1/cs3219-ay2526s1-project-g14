// Using mock data instead of MongoDB
const { Session, Question, User } = require('../mockData');

// Create collaboration session (called by external matching service)
exports.createSession = async (req, res) => {
    try {
        const { users, difficulty, topic, questionData } = req.body;

        // Validate required fields
        if (!users || !Array.isArray(users) || users.length !== 2) {
            return res.status(400).json({ 
                success: false, 
                error: 'Must provide exactly 2 users in array format' 
            });
        }

        // Validate users have required fields
        for (const user of users) {
            if (!user.userId || !user.username) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Each user must have userId and username' 
                });
            }
        }

        // Get question (priority: questionData > database lookup > random selection)
        let question;
        
        if (questionData) {
            // Use provided question data directly (from matching service)
            question = questionData;
            
            // If questionData has an ID but no other fields, try to fetch from database
            if (questionData.questionId && !questionData.title && !questionData.description) {
                try {
                    const dbQuestion = await Question.findById(questionData.questionId);
                    if (dbQuestion) {
                        // Merge database question with any provided metadata
                        question = { ...dbQuestion.toObject(), ...questionData };
                    }
                } catch (err) {
                    console.warn('Could not fetch question from database:', err.message);
                }
            }
        } else if (difficulty && topic) {
            // Find random question matching criteria
            const randomQuestions = await Question.aggregate([
                { $match: { difficulty, topic: { $in: [new RegExp(`^${topic}$`, "i")] } } },
                { $sample: { size: 1 } }
            ]);

            if (randomQuestions.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'No questions available for selected criteria' 
                });
            }
            question = randomQuestions[0];
        } else {
            return res.status(400).json({ 
                success: false, 
                error: 'Must provide questionData or both difficulty and topic for random selection' 
            });
        }

        // Extract metadata from question
        const sessionDifficulty = difficulty || question.difficulty;
        const sessionTopic = topic || (Array.isArray(question.topic) ? question.topic[0] : question.topic);

        // Create collaboration session
        const session = await Session.create({
            participants: users.map(user => ({
                userId: user.userId,
                username: user.username,
                joinedAt: new Date()
            })),
            questionId: question._id || question.questionId || null,
            difficulty: sessionDifficulty,
            topic: sessionTopic,
            status: 'active',
            startTime: new Date(),
            // Store question metadata for easy access
            questionMetadata: {
                title: question.title,
                description: question.description,
                examples: question.examples || [],
                image: question.image || null,
                topics: Array.isArray(question.topic) ? question.topic : [question.topic]
            }
        });

        res.status(201).json({
            success: true,
            payload: {
                sessionId: session.sessionId,
                session: session,
                question: question,
                participants: users,
                metadata: {
                    hasImage: !!question.image,
                    exampleCount: question.examples ? question.examples.length : 0,
                    topics: Array.isArray(question.topic) ? question.topic : [question.topic]
                }
            }
        });

    } catch (error) {
        console.error('Create session error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// Get session details
exports.getSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await Session.findOne({ sessionId })
            .populate('questionId')
            .populate('participants.userId', 'username');

        if (!session) {
            return res.status(404).json({ 
                success: false, 
                error: 'Session not found' 
            });
        }

        res.status(200).json({
            success: true,
            payload: session
        });
    } catch (error) {
        console.error('Get session error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// Update session code
exports.updateSessionCode = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { code, language } = req.body;

        const session = await Session.findOneAndUpdate(
            { sessionId },
            { 
                code, 
                language,
                status: 'in_progress'
            },
            { new: true }
        );

        if (!session) {
            return res.status(404).json({ 
                success: false, 
                error: 'Session not found' 
            });
        }

        res.status(200).json({
            success: true,
            payload: session
        });
    } catch (error) {
        console.error('Update session code error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// End session
exports.endSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await Session.findOneAndUpdate(
            { sessionId },
            { 
                status: 'completed',
                endTime: new Date()
            },
            { new: true }
        );

        if (!session) {
            return res.status(404).json({ 
                success: false, 
                error: 'Session not found' 
            });
        }

        // Session ended successfully - no cleanup needed for external matching service

        res.status(200).json({
            success: true,
            payload: session
        });
    } catch (error) {
        console.error('End session error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// Get user's active session
exports.getUserSession = async (req, res) => {
    try {
        const { userId } = req.params;

        const session = await Session.findOne({
            'participants.userId': userId,
            status: { $in: ['active', 'in_progress'] }
        }).populate('questionId');

        res.status(200).json({
            success: true,
            payload: session
        });
    } catch (error) {
        console.error('Get user session error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
