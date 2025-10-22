const Session = require("../model/sessionModel")
const Question = require("../model/questionModel");
const User = require("../model/userModel");
const socketService = require("../services/socketService");

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

        // Validate that users exist in DB
        const participants = [];
        for (const u of users) {
            const userDoc = await User.findById(u.userId);
            if (!userDoc) {
                return res.status(404).json({
                    success: false,
                    error: `User with ID ${u.userId} not found`,
                });
            }
            participants.push({
                userId: userDoc._id,
                joinedAt: new Date(),
            });
        }

        // Get question (priority: questionData > database lookup > random selection)
        let question;

        if (questionData?.questionId) {
            question = await Question.findOne({ questionId: questionData.questionId });
            if (!question) {
                return res.status(404).json({
                    success: false,
                    error: `Question with ID ${questionData.questionId} not found`,
                });
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

        // Create collaboration session
        const session = await Session.create({
            participants,
            questionId: question._id,
            status: "active",
            code: "",
            language: "javascript",
            startTime: new Date(),
        });

        // Emit event via socket.io 
        socketService.io.emit("sessionCreated", {
            sessionId: session.sessionId.replace(/^room:/, ''),
            participants: participants.map((p) => p.userId),
            topic: topic || question.topic,
            difficulty: difficulty || question.difficulty,
            questionTitle: question.title,
        });

        return res.status(201).json({
            success: true,
            payload: {
                sessionId: session.sessionId.replace(/^room:/, ''),
                session,
                question,
            },
        });

    } catch (error) {
        console.error('Create session error:', error);
        res.status(500).json({ success: false, error: error.message || 'Server Error' });
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

        // Emit real-time code update
        socketService.io.to(sessionId.replace(/^room:/, '')).emit("code-updated", { code, language });

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