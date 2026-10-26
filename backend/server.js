const cors = require("cors");
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const Feedback = require("./models/Feedback");


const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Feedback Admin API is running!");
});
app.get("/api/feedback", async (req, res) => {
  const feedback = await Feedback.find();
  res.json(feedback);
});
app.post("/api/feedback", async (req, res) => {
  const newFeedback = new Feedback(req.body);
  const savedFeedback = await newFeedback.save();
  res.status(201).json(savedFeedback);
});
app.put("/api/feedback/:id", async (req, res) => {
  const updated = await Feedback.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  res.json(updated);
});
app.delete("/api/feedback/:id", async (req, res) => {
  const deleted = await Feedback.findByIdAndDelete(req.params.id);
  res.json(deleted);
});


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });