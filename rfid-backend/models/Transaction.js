const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  userName: { type: String }, 
  amount: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);