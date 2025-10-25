const axios = require('axios');
const Session = require('../models/sessionModel');
const socketService = require('../services/socketService');

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:5050';
const QUESTION_SERVICE_URL = process.env.QUESTION_SERVICE_URL || 'http://localhost:5050';

exports.createSession = async (req, res) => {
    try {
        const { users, difficulty, topic, questionData } = req.body;

        // Must have exactly 2 users for paired sessions
        if (!users || !Array.isArray(users) || users.length !== 2) {
            return res.status(400).json({
                success: false,
                error: 'Must provide exactly 2 users in array format'
            });
        }

        const participants = [];
        for (const u of users) {
            participants.push({
                userId: u.userId,
                joinedAt: new Date(),
            });
        }

        let question;
        
        if (questionData?.questionId) {
            try {
                const questionResponse = await axios.get(`${QUESTION_SERVICE_URL}/questions/${questionData.questionId}`);
                question = questionResponse.data;
            } catch (error) {
                return res.status(404).json({
                    success: false,
                    error: `Question with ID ${questionData.questionId} not found`,
                });
            }
        } else if (difficulty && topic) {
            try {
                const questionResponse = await axios.get(`${QUESTION_SERVICE_URL}/internal/questions/random-question`, {
                    params: { difficulty, topic }
                });
                question = questionResponse.data?.payload || questionResponse.data;
            } catch (error) {
                console.error('Failed to fetch random question:', error.response?.data || error.message);
                return res.status(404).json({
                    success: false,
                    error: 'No questions available for selected criteria'
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                error: 'Must provide questionData or both difficulty and topic for random selection'
            });
        }

        const session = await Session.create({
            participants,
            questionId: question.questionId,
            status: "active",
            code: "",
            language: "javascript",
            startTime: new Date(),
        });

        socketService.io.emit("sessionCreated", {
            sessionId: session.sessionId,
            participants: participants.map((p) => p.userId),
            topic: topic || question.topic,
            difficulty: difficulty || question.difficulty,
            questionTitle: question.title,
        });

        return res.status(201).json({
            success: true,
            payload: {
                sessionId: session.sessionId,
                session,
                question,
            },
        });

    } catch (error) {
        console.error('Create session error:', error);
        res.status(500).json({ success: false, error: error.message || 'Server Error' });
    }
};

exports.getSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await Session.findOne({ sessionId });

        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

        // Convert to plain object first so we can modify it
        const sessionObj = session.toObject();

        // Fetch full question details
        try {
            const questionResponse = await axios.get(`${QUESTION_SERVICE_URL}/internal/questions/${session.questionId}`);
            sessionObj.questionId = questionResponse.data.payload || questionResponse.data;
        } catch (error) {
            console.error('Failed to fetch question details:', error.message);
        }

        // Fetch participant usernames
        const participantsWithUsernames = await Promise.all(
            session.participants.map(async (p) => {
                try {
                    const userResponse = await axios.get(`${USER_SERVICE_URL}/users/${p.userId}`);
                    return {
                        ...p.toObject(),
                        userId: {
                            _id: p.userId,
                            username: userResponse.data.username
                        }
                    };
                } catch (error) {
                    return p;
                }
            })
        );

        sessionObj.participants = participantsWithUsernames;

        res.status(200).json({
            success: true,
            payload: sessionObj
        });
    } catch (error) {
        console.error('Get session error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

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

        socketService.io.to(sessionId).emit("code-updated", { code, language });

        res.status(200).json({
            success: true,
            payload: session
        });
    } catch (error) {
        console.error('Update session code error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.endSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user?.id;

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

        // Notify all users in the session via WebSocket
        socketService.io.to(sessionId).emit('session-ended', {
            endedBy: userId || 'user',
            message: 'Session has been ended'
        });

        res.status(200).json({
            success: true,
            payload: session
        });
    } catch (error) {
        console.error('End session error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.getUserSession = async (req, res) => {
    try {
        const { userId } = req.params;

        const session = await Session.findOne({
            'participants.userId': userId,
            status: { $in: ['active', 'in_progress'] }
        });

        if (session && session.questionId) {
            try {
                const questionResponse = await axios.get(`${QUESTION_SERVICE_URL}/internal/questions/${session.questionId}`);
                session.questionId = questionResponse.data;
            } catch (error) {
                console.error('Failed to fetch question details:', error.message);
            }
        }

        res.status(200).json({
            success: true,
            payload: session
        });
    } catch (error) {
        console.error('Get user session error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

