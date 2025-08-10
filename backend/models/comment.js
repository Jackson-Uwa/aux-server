const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
  message: {
    type: String,
    required: [true, "Enter a comment"],
  },
  post: {
    type: mongoose.Schema.ObjectId,
    ref: "Post",
    required: [true, "No post to comment on"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Comment", commentSchema);
