const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http"); 
const { Server } = require("socket.io"); 
const User = require("./models/User"); 
const Book = require("./models/Book");
const Attendance = require("./models/Attendance"); 
const Transaction = require("./models/Transaction");
const Timetable = require("./models/Timetable"); 
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());


let pendingCafeAmount = 0; 
let isLibraryIssueActive = false; 

// --- 🟢 SOCKET.IO SETUP ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("⚡ New Device/Browser Connected:", socket.id);
});

// --- 🟢 DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected!"))
  .catch(err => console.log("❌ DB Connection Error:", err));

// --- 🟢 PORTAL CONTROL APIs ---
app.post("/api/cafe/set-amount", (req, res) => {
  const { amount } = req.body;
  pendingCafeAmount = Number(amount);
  console.log(`🎯 Cafe Terminal Ready for: RS ${pendingCafeAmount}`);
  res.json({ success: true, message: `Terminal set for RS ${pendingCafeAmount}` });
});

// 🟢 New: Librarian portal 
app.post("/api/library/set-issue-mode", (req, res) => {
  const { active } = req.body;
  isLibraryIssueActive = active;
  console.log(`📚 Library Scan Mode: ${active ? "ENABLED" : "DISABLED"}`);
  res.json({ success: true, isLibraryIssueActive });
});

// --- 1. AUTH & USER ROUTES ---
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ studentId: username, password: password });
    if (user) {
      if (user.status === "blocked") return res.status(403).json({ message: "Account Blocked!" });
      const { password: _, ...userData } = user._doc;
      res.json(userData);
    } else {
      res.status(401).json({ message: "Invalid ID or Password" });
    }
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/api/register", async (req, res) => {
  try {
    const { rfidTag } = req.body;
    if (rfidTag) {
      const duplicate = await User.findOne({ rfidTag });
      if (duplicate) return res.status(400).json({ success: false, message: "RFID Tag already assigned!" });
    }
    const newUser = new User({ ...req.body, status: "active", wallet: 0, attendance: 0 });
    const savedUser = await newUser.save();
    res.status(201).json({ 
      success: true, 
      message: "Registered Successfully!",
      studentId: savedUser.studentId 
    });
  } catch (error) { res.status(400).json({ success: false, message: error.message || "Registration Failed" }); }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put("/api/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { studentId } = req.body;
    if (studentId) {
      const duplicateId = await User.findOne({ studentId, _id: { $ne: userId } });
      if (duplicateId) return res.status(400).json({ message: "ID exists!" });
    }
    const updatedUser = await User.findByIdAndUpdate(userId, { $set: req.body }, { new: true });
    res.json({ success: true, user: updatedUser });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.patch("/api/users/status/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.status = user.status === "active" ? "blocked" : "active";
    await user.save();
    res.json({ success: true, status: user.status });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) return res.status(404).json({ message: "User not found" });
    const sId = userToDelete.studentId;
    const mId = userToDelete._id;
    await Attendance.deleteMany({ userId: mId });
    await Transaction.deleteMany({ studentId: sId });
    await Book.updateMany({ "issuedTo.studentId": sId }, { $pull: { issuedTo: { studentId: sId } } });
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User and all related data cleared." });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- 2. FINANCE & WALLET ---
app.get("/api/finance/history", async (req, res) => {
  try {
    const logs = await Transaction.find().sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/wallet/topup", async (req, res) => {
  const { studentId, amount } = req.body;
  try {
    const user = await User.findOneAndUpdate({ studentId }, { $inc: { wallet: Number(amount) } }, { new: true });
    if (!user) return res.status(404).json({ message: "Student not found!" });
    const newTransaction = new Transaction({ studentId, userName: user.name, amount: Number(amount) });
    await newTransaction.save();
    res.json({ success: true, newBalance: user.wallet });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- 3. SCAN LOGIC ---
app.post("/api/scan/identify", async (req, res) => {
  const { rfidTag } = req.body;
  try {
    const user = await User.findOne({ rfidTag: { $regex: new RegExp(`^${rfidTag.trim()}$`, "i") } });
    if (!user) return res.status(404).json({ message: "Student record not found!" });
    if (user.status === "blocked") return res.status(403).json({ message: "CARD BLOCKED!" });
    res.json({ success: true, user });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/api/scan", async (req, res) => {
  const { rfidTag, subject } = req.body;
  const scanMode = (req.body.mode || req.body.terminalType || "").toUpperCase(); 

  try {
    const user = await User.findOne({ rfidTag: { $regex: new RegExp(`^${rfidTag.trim()}$`, "i") } });
    if (!user) return res.status(404).json({ message: "Card not registered!" });
    if (user.status === "blocked") return res.status(403).json({ message: "CARD BLOCKED!" });

    if (scanMode === "CAFE") {
      if (pendingCafeAmount <= 0) {
        return res.status(400).json({ success: false, message: "First enter amount in portal!" });
      }
      const price = pendingCafeAmount; 
      
      // 🟢 FIXED: Notify Portal of Low Balance failure via Socket & Reset State
      if (user.wallet < price) {
        io.emit("cafe-payment-failed", { message: "Low Balance!", userName: user.name });
        pendingCafeAmount = 0; // Essential to reset the gated logic on failure
        return res.status(400).json({ message: "Low Balance!" });
      }

      user.wallet -= price;
      await new Transaction({ studentId: user.studentId, userName: user.name, amount: -price }).save();
      await user.save();

      io.emit("cafe-payment-done", { success: true, userName: user.name, amount: price });
      pendingCafeAmount = 0; 
      return res.json({ success: true, message: `Paid RS ${price}`, user });
    } 
    else if (scanMode === "GATE") {
      await new Attendance({ userId: user._id, status: "present", subject: "GATE_ENTRY" }).save();
      return res.json({ success: true, message: `Welcome ${user.name}!`, user });
    }
    else if (scanMode === "BUS") {
      if (!user.bus) return res.status(403).json({ message: "Not Enrolled in Bus!" });
      await new Attendance({ userId: user._id, status: "present", subject: "BUS_ENTRY" }).save();
      return res.json({ success: true, message: "Access Granted: Bus", user });
    }
    else {
      if (!subject) return res.status(400).json({ message: "Select a subject first!" });
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const alreadyMarked = await Attendance.findOne({ userId: user._id, subject: subject, createdAt: { $gte: startOfToday } });
      if (alreadyMarked) return res.status(400).json({ message: "Already marked today!" });

      let scanStatus = (now.getHours() >= 9) ? "late" : "present";
      await new Attendance({ userId: user._id, status: scanStatus, subject }).save();
      user.attendance = (user.attendance || 0) + 1;
      await user.save();
      return res.json({ success: true, message: `Present for ${subject}`, user });
    }
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- 4. LIBRARY ROUTES ---
app.get("/api/library/books", async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (err) { res.status(500).json(err); }
});

app.post("/api/library/issue-request", async (req, res) => {
  const { rfidTag } = req.body;
  if (!isLibraryIssueActive) {
    return res.status(400).json({ success: false, message: "First activate issue on portal!" });
  }
  
  io.emit("library-tag-captured", rfidTag); 
  io.emit("new-rfid-captured", rfidTag); 
  
  isLibraryIssueActive = false; 
  res.json({ success: true, message: "Card sent to Library Portal" });
});

app.post("/api/library/add", async (req, res) => {
  try {
    const { title, author, totalStock, rfidTag } = req.body;
    const existingBook = await Book.findOne({ title: { $regex: new RegExp(`^${title}$`, "i") } });
    if (existingBook) {
      existingBook.totalStock += Number(totalStock);
      if(rfidTag) existingBook.rfidTag = rfidTag; 
      await existingBook.save();
      return res.json({ success: true, message: "Stock updated!" });
    } else {
      const newBook = new Book({ title, author, totalStock: Number(totalStock), rfidTag, issuedTo: [] });
      await newBook.save();
      return res.json({ success: true, message: "New book added!" });
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch("/api/library/issue", async (req, res) => {
  const { bookId, studentId, rfidTag } = req.body;
  try {
    let validUser;
    if (rfidTag) {
      validUser = await User.findOne({ rfidTag: { $regex: new RegExp(`^${rfidTag.trim()}$`, "i") } });
    } else {
      validUser = await User.findOne({ studentId: studentId.toUpperCase().trim() });
    }
    if (!validUser) return res.status(404).json({ message: "Student record not found!" });
    const allBooks = await Book.find({ "issuedTo.studentId": validUser.studentId });
    if (allBooks.length >= 5) return res.status(400).json({ message: "Limit Reached! (5 books)" });

    const iDate = new Date();
    const rDate = new Date();
    rDate.setDate(iDate.getDate() + 5);
    await Book.findByIdAndUpdate(bookId, { $push: { issuedTo: { studentId: validUser.studentId, issueDate: iDate, returnDate: rDate } } });
    res.json({ success: true, message: `Book issued to ${validUser.name}!` });
  } catch (err) { res.status(500).json({ message: "Internal Error" }); }
});

app.patch("/api/library/return", async (req, res) => {
  const { bookId, studentId } = req.body;
  try {
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found!" });
    const index = book.issuedTo.findIndex(entry => entry.studentId === studentId.toUpperCase());
    if (index > -1) {
      book.issuedTo.splice(index, 1);
      await book.save();
      res.json({ success: true, message: "Returned." });
    } else { res.status(404).json({ message: "Record not found." }); }
  } catch (err) { res.status(500).json(err); }
});

// --- 5. TIMETABLE ---
app.get("/api/timetable", async (req, res) => {
  try {
    const schedules = await Timetable.find().sort({ day: 1, startTime: 1 });
    res.json(schedules);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/timetable", async (req, res) => {
  const { day, startTime, endTime, room, teacher } = req.body;
  try {
    const conflict = await Timetable.findOne({
      day,
      $or: [
        { room, $and: [{ startTime: { $lt: endTime } }, { endTime: { $gt: startTime } }] },
        { teacher, $and: [{ startTime: { $lt: endTime } }, { endTime: { $gt: startTime } }] }
      ]
    });
    if (conflict) return res.status(400).json({ message: `Collision! ${conflict.subject}` });
    const newSlot = new Timetable(req.body);
    await newSlot.save();
    res.status(201).json(newSlot);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete("/api/timetable/:id", async (req, res) => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json(err); }
});

// --- 6. LOGS & CAPTURE ---
app.get("/api/attendance", async (req, res) => {
  try {
    const logs = await Attendance.find().populate("userId", "name studentId department").sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) { res.status(500).json(err); }
});

app.post("/api/capture-rfid", async (req, res) => {
  const { rfidTag } = req.body;
  try {
    const existingUser = await User.findOne({ rfidTag: { $regex: new RegExp(`^${rfidTag.trim()}$`, "i") } });
    if (existingUser) {
      io.emit("rfid-collision", { message: `Student: ${existingUser.name}`, tag: rfidTag });
    } else {
      io.emit("new-rfid-captured", rfidTag);
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/capture-library-rfid", async (req, res) => {
  const { rfidTag } = req.body;
  io.emit("new-rfid-captured", rfidTag); 
  io.emit("library-tag-captured", rfidTag); 
  res.json({ success: true, message: "Tag sent to Library Portal" });
});

// --- 🟢 7. NEWS SECTION ---
const newsSchema = new mongoose.Schema({ title: String, description: String, category: { type: String, default: "General" }, date: { type: Date, default: Date.now } });
const News = mongoose.model("News", newsSchema);

app.get("/api/news", async (req, res) => { 
  try { const allNews = await News.find().sort({ date: -1 }); res.json(allNews); } catch (err) { res.status(500).json({ message: "Error" }); } 
});

app.post("/api/admin/news", async (req, res) => {
  try { const newEntry = new News(req.body); await newEntry.save(); res.status(201).json({ success: true }); } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put("/api/admin/news/:id", async (req, res) => {
  try { await News.findByIdAndUpdate(req.params.id, req.body); res.json({ success: true }); } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/admin/news/:id", async (req, res) => {
  try { await News.findByIdAndDelete(req.params.id); res.json({ success: true }); } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch("/api/users/change-password/:id", async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.password !== oldPassword) return res.status(400).json({ message: "Error with password!" });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: "Password has been changed!" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- 🚀 START SERVER ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server + Socket running on port ${PORT}`);
});