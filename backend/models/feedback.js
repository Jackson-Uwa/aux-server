const mongoose = require("mongoose");

const feedbackSchema = mongoose.Schema({
  review: {
    type: String,
    required: [true, "Enter your review"],
  },
  rating: {
    type: Number,
    required: [true, "Kindly rate this product"],
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
    required: [true, "No product to provide feedback"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Invalid user ID / Log in to provide feeback"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

feedbackSchema.index({ product: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Feedback", feedbackSchema);
