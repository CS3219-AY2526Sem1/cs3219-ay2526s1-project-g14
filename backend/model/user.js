const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    }
  },
  { timestamps: true, collection: 'user' }
);

module.exports = mongoose.model("user", userSchema);