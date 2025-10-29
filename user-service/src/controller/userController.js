const mongoose = require("mongoose");
const User = require("../model/userModel.js");
const TempEmail = require("../model/tempEmailModel.js");
const bcrypt = require("bcryptjs");
const { generateOtp, sendOTPEmail } = require("../middleware/auth.js");

exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID format.", });
    }

    const user = await User.findById(userId).select("-password -__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found.",
      });
    }
    res.status(200).json({
      success: true,
      result: user,
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ success: false, error: err.message, });
  }
};

// /user/batch
exports.getUsersByIds = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body must contain a non-empty 'ids' array.",
      });
    }

    const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid user IDs provided.",
      });
    }

    const users = await User.find(
      { _id: { $in: validIds } },
      { username: 1, email: 1 } 
    ).lean();

    res.status(200).json({
      success: true,
      users,
    });
  } catch (err) {
    console.error("Error fetching users batch:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateUsername = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username } = req.body;

    if (!username || username.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username: username.trim() },
      { new: true, runValidators: true }
    ).select("username email updatedAt");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Username updated successfully"
    });
  } catch (err) {
    console.error("updateUsername error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: "All fields are required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Incorrect current password" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("updatePassword error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.requestEmailChange = async (req, res) => {
  try {
    const { newEmail } = req.body;
    const userId = req.user.id;
    if (!newEmail) {
      return res.status(400).json({ success: false, message: "New email is required" });
    }

    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }
    let temp = await TempEmail.findOne({ email: newEmail });
    if (temp && temp.lastOtpSentAt && Date.now() - temp.lastOtpSentAt.getTime() < 30 * 1000) {
      const wait = 30 - Math.floor((Date.now() - temp.lastOtpSentAt.getTime()) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${wait}s before requesting another OTP`,
      });
    }

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    if (temp) {
      temp.otp = otp;
      temp.otpExpires = otpExpires;
      temp.lastOtpSentAt = new Date();
      temp.originalUserId = userId;
      await temp.save();
    } else {
      temp = await TempEmail.create({
        email: newEmail,
        otp,
        otpExpires,
        lastOtpSentAt: new Date(),
        originalUserId: userId,
      });
    }

    await sendOTPEmail(newEmail, otp);
    res.status(200).json({
      success: true,
      message: "OTP sent to new email for verification",
    });
  } catch (err) {
    console.error("requestEmailChange error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.verifyEmailChange = async (req, res) => {
  try {
    const { newEmail, otp } = req.body;
    const userId = req.user.id;

    if (!newEmail || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP required" });
    }
    const temp = await TempEmail.findOne({ email: newEmail });
    if (!temp) {
      return res.status(400).json({ success: false, message: "No pending email change found" });
    }

    if (temp.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (temp.otpExpires < new Date()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    await User.findByIdAndUpdate(userId, { email: newEmail });
    await TempEmail.deleteOne({ email: newEmail });

    res.status(200).json({ success: true, message: "Email updated successfully" });
  } catch (err) {
    console.error("verifyEmailChange error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    await User.findByIdAndDelete(userId);
    res.status(200).json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    console.error("deleteAccount error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};