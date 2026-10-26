
const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  courseDuration: {
    type: String,
    required: true
  },
  comments: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  }
});

module.exports = mongoose.model("Feedback", feedbackSchema);
