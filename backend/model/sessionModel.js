const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true,
        default: () => new mongoose.Types.ObjectId().toString()
    },
    participants: {
        type: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user',
                required: true
            },
            username: {
                type: String,
                required: true
            },
            joinedAt: {
                type: Date,
                default: Date.now
            }
        }],
        validate: {
            validator: function(participants) {
                return participants.length === 2;
            },
            message: 'A collaboration session must have exactly 2 participants'
        }
    },
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'question',
        required: true
    },
    difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["active", "in_progress", "completed", "cancelled"],
        default: "active"
    },
    code: {
        type: String,
        default: ""
    },
    language: {
        type: String,
        default: "javascript"
    },
    startTime: {
        type: Date
    },
    endTime: {
        type: Date
    },
    chatHistory: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        username: String,
        message: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    questionMetadata: {
        title: String,
        description: String,
        examples: [{
            input: String,
            output: String
        }],
        image: String,
        topics: [String]
    }
}, { 
    timestamps: true, 
    collection: 'sessions' 
});

// Index for efficient matching queries
sessionSchema.index({ status: 1, difficulty: 1, topic: 1 });
sessionSchema.index({ participants: 1 });

module.exports = mongoose.model("Session", sessionSchema);
