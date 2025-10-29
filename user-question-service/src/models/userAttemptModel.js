const mongoose = require("mongoose");

const userAttemptSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    questionId: {
      type: Number,
      required: true
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    code: {
      type: String,
      required: true
    },
    language: {
      type: String,
      enum: ["javascript", "python", "java", "c++"],
      default: "javascript"
    },
    status: {
      type: Boolean,
      required: true
    },
    testCasesPassed: {
      type: Number,
      default: 0
    },
    totalTestCases: {
      type: Number,
      default: 0
    },
    timeTaken: {
      type: Number,
      default: 0
    },
  },
  { timestamps: true, collection: "userattempts" }
);

userAttemptSchema.virtual("passingRate").get(function () {
  if (!this.totalTestCases || this.totalTestCases === 0) return 0;
  return Math.round((this.testCasesPassed / this.totalTestCases) * 100);
});
userAttemptSchema.set("toJSON", { virtuals: true });
userAttemptSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("UserAttempt", userAttemptSchema);