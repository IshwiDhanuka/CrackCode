const express = require('express');
const router = express.Router();
const User = require('../Models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

console.log('Auth routes loaded');

//Register route
router.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;
  console.log("Request body:", req.body);

  if (!username?.trim() || !email?.trim() || !password?.trim() || !role?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Please enter all the information"
    });
  }
  

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with the same email"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role.trim()
    });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
});


//Login route
router.post("/login", async (req, res) => {
  console.log("Login request body:", req.body); // Debug log
  const { email, password } = req.body;

  if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Please enter both email and password"
    });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // --- Streak and loginHistory logic ---
    const today = new Date();
    today.setHours(0,0,0,0);
    let loginHistory = user.loginHistory || [];
    let streak = user.streak || 0;
    if (!loginHistory.some(date => new Date(date).getTime() === today.getTime())) {
      // Add today to loginHistory
      loginHistory.push(today);
      // Sort and keep only unique days
      loginHistory = Array.from(new Set(loginHistory.map(d => new Date(d).setHours(0,0,0,0)))).map(ts => new Date(ts));
      loginHistory.sort((a, b) => a - b);
      // Calculate streak
      streak = 1;
      for (let i = loginHistory.length - 2; i >= 0; i--) {
        const diff = (loginHistory[i+1] - loginHistory[i]) / (1000*60*60*24);
        if (diff === 1) streak++;
        else if (diff > 1) break;
      }
    }
    // --- Badges logic ---
    let badges = user.badges || [];
    const badgeTemplates = [
      { name: "Streak 3 Days", icon: "🔥", condition: s => s >= 3 },
      { name: "Streak 7 Days", icon: "🔥", condition: s => s >= 7 },
      { name: "100 Problems", icon: "🏅", condition: () => (user.problemsSolved || 0) >= 100 },
      { name: "Early Bird", icon: "🌅", condition: () => true }
    ];
    badgeTemplates.forEach(b => {
      if (b.condition(streak) && !badges.some(bad => bad.name === b.name)) {
        badges.push({ name: b.name, icon: b.icon, achievedAt: new Date() });
      }
    });
    // Save user
    user.loginHistory = loginHistory;
    user.streak = streak;
    user.badges = badges;
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        streak: user.streak,
        badges: user.badges
      },
      token
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
});

module.exports = router;
