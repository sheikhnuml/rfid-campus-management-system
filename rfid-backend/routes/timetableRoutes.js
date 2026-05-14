const express = require("express");
const router = express.Router();
const Timetable = require("../models/Timetable");

// 1. Get All Schedules
router.get("/", async (req, res) => {
  try {
    const schedules = await Timetable.find().sort({ day: 1, startTime: 1 });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Add New Slot
router.post("/", async (req, res) => {
  const { subject, teacher, day, startTime, endTime, room } = req.body;
  const newSlot = new Timetable({ subject, teacher, day, startTime, endTime, room });

  try {
    const savedSlot = await newSlot.save();
    res.status(201).json(savedSlot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 3. Delete a Slot
router.delete("/:id", async (req, res) => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ message: "Schedule slot deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;