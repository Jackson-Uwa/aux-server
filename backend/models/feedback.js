const mongoose = require("mongoose");

const feedBackSchema = mongoose.Schema({
  text: {
    type: String,
    required: [true, "Please enter title"],
  },
  rating: {
    type: Number,
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
    required: "No product to provide feedbackk on",
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [false, "no user id for this comment"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Feedback", feedBackSchema);
