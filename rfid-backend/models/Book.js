const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String },
  totalStock: { type: Number, default: 1 },

  rfidTag: { 
    type: String, 
    unique: true,   
    sparse: true,   
    trim: true,     
    lowercase: true 
  },

  
  issuedTo: [{
    studentId: { type: String, required: true },
    issueDate: { type: Date, default: Date.now },
    returnDate: { type: Date, required: true }
  }]
}, { timestamps: true });

module.exports = mongoose.model("Book", bookSchema);