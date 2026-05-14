const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  studentId: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true }, 
  role: { 
    type: String, 
    enum: ["admin", "student", "cafe", "library", "transport", "security"], 
    default: "student" 
  },
  
  // 🔴 UPDATED FOR BETTER COLLISION PROTECTION
  rfidTag: { 
    type: String, 
    unique: true, 
    sparse: true, 
    trim: true,      // Fixes space issues
    lowercase: true, // Standardizes the ID format
    index: true      // Speeds up gate/bus scanning
  },

  wallet: { type: Number, default: 0 },
  attendance: { type: Number, default: 0 },
  email: { type: String, trim: true },
  department: { type: String, default: "Computer Science" },
  semester: { type: String },
  shopName: { type: String },
  location: { type: String }, 
  section: { type: String }, 
  status: { type: String, default: "active" },
  subjects: { type: [String], default: [] }, 

  // 🚌 --- TRANSPORT FIELDS PRESERVED ---
  bus: { type: Boolean, default: false }, 
  busRoute: { type: String, default: "N/A" }, 
  busStop: { type: String, default: "N/A" }, 
  
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);