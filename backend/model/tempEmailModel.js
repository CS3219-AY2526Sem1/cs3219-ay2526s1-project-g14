const mongoose = require("mongoose");

const tempEmailSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    otpExpires: {
      type: Date,
      required: true,
    },
    lastOtpSentAt: {
      type: Date,
      default: Date.now,
    },
    originalUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, collection: "tempemails" }
);

module.exports = mongoose.model("TempEmail", tempEmailSchema);