const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
  comment: {
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
    required: [true, "Invalid user ID / Log in to make a comment on this post"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

commentSchema.index({ post: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Comment", commentSchema);
