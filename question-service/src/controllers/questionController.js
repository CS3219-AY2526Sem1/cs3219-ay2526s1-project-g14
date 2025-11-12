/**
 * AI Usage
 * This file contains code enhanced with ChatGPT assistance.
 * Specific improvements: added input validation for questionId, improved error handling for missing or invalid IDs, 
 * and clarified response structure for consistency with internal service calls.
 * See /ai-usage-log.md for detailed attribution and modifications.
 * Date: 2025-10-21
 */

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

// fetch a single question by its questionId field (for internal service call)
exports.getQuestionByQuestionId = async (req, res) => {
    try {
        const { questionId } = req.params;
        
        // Convert to number if it's a string
        const qId = Number(questionId);
        
        if (isNaN(qId)) {
            return res.status(400).json({ success: false, message: "Invalid question ID format." });
        }

        const question = await Question.findOne({ questionId: qId });

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found.",
            });
        }
        res.status(200).json({ success: true, payload: question });
    } catch (err) {
        console.error("Error fetching question:", err);
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

exports.getLastQuestionId = async (req, res) => {
    try {
        const lastQuestion = await Question.findOne().sort({ questionId: -1 }).limit(1);
        const lastId = lastQuestion ? lastQuestion.questionId : 0;
        console.log("res", res)
        console.log("lastQuestion", lastQuestion)

        res.status(200).json({
            success: true,
            payload: { questionId: lastId },
        });
    } catch (err) {
        console.error("Error fetching last question ID:", err);
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
};

exports.addQuestion = async (req, res) => {
    try {
        const { questionId, title, description, difficulty, topic, examples, image } = req.body;

        if (!questionId || !title || !difficulty || !topic) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const newQuestion = new Question({
            questionId,
            title,
            description,
            difficulty,
            topic,
            examples,
            image,
        });

        await newQuestion.save();

        res.status(201).json({ success: true, message: "Question added successfully", payload: newQuestion });
    } catch (err) {
        console.error("Error adding question:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};


