const mongoose = require("mongoose");

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

// Get a single question by its MongoDB ObjectId
exports.getQuestionById = async (req, res) => {
    try {
        const { questionId } = req.params;
        console.log("req", req)

        if (!mongoose.Types.ObjectId.isValid(questionId)) {
            return res.status(400).json({ success: false, message: "Invalid question ID format.", });
        }

        const question = await Question.findById(questionId);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found.",
            });
        }
        res.status(200).json({ success: true, payload: question, });
    } catch (err) {
        console.error("Error fetching question:", err);
        res.status(500).json({ success: false, error: err.message, });
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

exports.getRandomQuestion = async (req, res) => {
    try {
        const { topic, difficulty } = req.query;
        const match = {};

        if (topic) match.topic = { $in: [new RegExp(`^${topic}$`, "i")] };
        if (difficulty) match.difficulty = difficulty;

        const randomQuestion = await Question.aggregate([
            { $match: match },
            { $sample: { size: 1 } },
        ]);

        if (randomQuestion.length === 0) {
            return res.status(404).json({ success: false, message: "No questions found." });
        }

        res.status(200).json({ success: true, payload: randomQuestion[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

