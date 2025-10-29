const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_CONNECTION || process.env.MONGODB_URI || 'mongodb://localhost:27017/attempt');
        console.log('MongoDB connected for Attempt Service');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = {
    connectDB
};
