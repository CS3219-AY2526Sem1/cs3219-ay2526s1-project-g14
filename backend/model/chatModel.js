const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: true,
        index: true // allows fast lookup by session
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true // allows sorting messages efficiently
    }
}, {
    timestamps: true,
    collection: 'chats'
});

// for fetching messages of a session in order
chatSchema.index({ sessionId: 1, timestamp: 1 });

module.exports = mongoose.model("Chat", chatSchema);
