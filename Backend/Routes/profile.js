const express = require('express');
const router = express.Router();
const User = require('../Models/User');
const Problem = require('../Models/Problems');
const authMiddleware = require('../Middleware/authMiddleware');

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    console.log('Profile route hit, user:', req.user);
    const user = await User.findById(req.user._id);
    if (!user) {
      console.log('User not found for id:', req.user._id);
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const totalProblems = await Problem.countDocuments();
    const solvedProblems = user.solvedProblems || [];
    res.json({
      success: true,
      user: {
        username: user.username,
        email: user.email,
        solvedProblems,
        problemsSolved: solvedProblems.length,
        totalProblems,
        streak: user.streak || 0,
        badges: user.badges || []
      }
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router; 