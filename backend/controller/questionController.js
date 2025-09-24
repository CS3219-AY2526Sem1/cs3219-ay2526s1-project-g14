const Question = require("../model/questionModel.js");

exports.getQuestions = async (req, res) => {
    try {
        const questions = await Question.find();
        res.status(200).json({ success: true, payload: questions });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};


