const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  teacher: { type: String, required: true },
  day: { 
    type: String, 
    required: true, 
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] 
  },
  startTime: { type: String, required: true }, // e.g., "09:00"
  endTime: { type: String, required: true },   // e.g., "10:30"
  room: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Timetable", timetableSchema);