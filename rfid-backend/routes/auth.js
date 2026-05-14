const router = require("express").Router();
const User = require("../models/User");

// Login Route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    //find in DB
    const user = await User.findOne({ studentId: username });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Password check (simple comparison)
    if (user.password !== password) {
      return res.status(401).json({ message: "Wrong credentials!" });
    }

    // Success
    const { password: _, ...userData } = user._doc;
    res.status(200).json(userData);

  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;