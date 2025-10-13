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
                ref: 'User',
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

// Index for efficient matching queries
sessionSchema.index({ status: 1, difficulty: 1, topic: 1 });
sessionSchema.index({ "participants.userId": 1, status: 1 }); // find sessions by participant

module.exports = mongoose.model("Session", sessionSchema);
