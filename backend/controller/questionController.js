const Question = require("../model/questionModel.js");

exports.getQuestions = async (req, res) => {
    try {
        const { topic, difficulty } = req.query;
        const filter = {};
        if (topic) filter.topic = { $in: [new RegExp(`^${topic}$`, 'i')] };
        if (difficulty) filter.difficulty = difficulty;
        const questions = await Question.find(filter);
        res.status(200).json({ success: true, payload: questions });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getTopics = async (req, res) => {
    try {
        const topics = await Question.distinct("topic");
        res.status(200).json({ success: true, payload: topics });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
} 

