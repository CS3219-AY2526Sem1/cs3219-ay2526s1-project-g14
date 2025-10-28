const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

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
                type: String,
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
        enum: ["javascript", "python", "java", "c++"],
        default: "javascript"
    },
    chatHistory: {
        type: [chatMessageSchema],
        default: []
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    },
}, { 
    timestamps: true, 
    collection: 'sessions' 
});

sessionSchema.index({ status: 1 });
sessionSchema.index({ "participants.userId": 1, status: 1 });

module.exports = mongoose.model("Session", sessionSchema);

