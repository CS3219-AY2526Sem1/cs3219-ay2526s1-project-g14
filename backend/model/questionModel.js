const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    questionId: {
        type: Number,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true,
        unique: true, 
        trim: true,
    },
    description: {
        type: String,
    },
    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"], 
        required: true,
    },
    topic: [
        {
            type: String,
            required: true,
            index: true, 
        }
    ],
    examples: [
        {
            input: { 
                type: String, 
                required: true 
            },
            output: { 
                type: String, 
                required: true 
            },
        },
    ],
    image: {
        type: String,
        required: false 
    },
}); 

module.exports = mongoose.model("question", questionSchema);
