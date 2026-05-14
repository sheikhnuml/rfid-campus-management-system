const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  subject: { 
    type: String, 
    required: true
  }, 
  status: { 
    type: String, 
    enum: ["present", "late", "absent"], 
    default: "present" 
  }
}, { timestamps: true });

module.exports = mongoose.model("Attendance", attendanceSchema);