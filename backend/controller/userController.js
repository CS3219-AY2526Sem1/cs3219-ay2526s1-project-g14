const mongoose = require("mongoose");
const User = require("../model/user.js");

exports.getUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid user ID format.", });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "user not found.",
            });
        }
        res.status(200).json({
            success: true,
            payload: user,
        });
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ success: false, error: err.message, });
    }
};