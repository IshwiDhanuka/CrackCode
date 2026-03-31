const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authMiddleware = require('../Middleware/authMiddleware');
const Submission = require('../Models/Submissions');
const User = require('../Models/User');

// POST — save a new submission + update points if Accepted
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { problemId, status, language, code } = req.body;

    if (!problemId || !status || !language || !code) {
      return res.status(400).json({
        success: false,
        message: 'All fields (problemId, status, language, code) are required.'
      });
    }

    // Validate status is a known value
    const validStatuses = ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const submission = new Submission({
      userId,
      problemId,
      status,
      language,
      code,
      submissionTime: new Date()
    });
    await submission.save();

    // Update solvedProblems + points if Accepted — SINGLE source of truth
    if (status === 'Accepted') {
      const user = await User.findById(userId);
      const problem = await mongoose.model('Problem').findById(problemId);
      const pid = problemId.toString();

      // FIX: null guard on both user and problem + solvedProblems undefined guard
      if (user && problem) {
        if (!Array.isArray(user.solvedProblems)) user.solvedProblems = [];

        if (!user.solvedProblems.includes(pid)) {
          user.solvedProblems.push(pid);
          user.problemsSolved = user.solvedProblems.length;

          let pointsToAdd = 0;
          if (problem.difficulty === 'Easy') pointsToAdd = 10;
          else if (problem.difficulty === 'Medium') pointsToAdd = 20;
          else if (problem.difficulty === 'Hard') pointsToAdd = 30;

          user.points = (user.points || 0) + pointsToAdd;
          await user.save();
          console.log(`[Submission] User ${userId} solved ${pid}, +${pointsToAdd} points`);
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Submission recorded.',
      submissionId: submission._id
    });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// GET — fetch submissions for a problem, scoped to the requesting user only
// SECURITY FIX: was unauthenticated and returned ALL users' code — leaks solutions
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { problemId } = req.query;
    if (!problemId) {
      return res.status(400).json({ success: false, message: 'problemId is required' });
    }

    // Only return THIS user's submissions — never expose other users' code
    const submissions = await Submission.find({
      problemId,
      userId: req.user._id
    }).sort({ submissionTime: -1 });

    res.json({ success: true, submissions });
  } catch (error) {
    console.error('Fetch submissions error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// GET — recent submissions for current user (used on profile page)
router.get('/recent', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    // FIX: handle negative/zero/NaN limit values + cap at 50
    const parsedLimit = parseInt(req.query.limit);
    const limit = Math.min(Math.max(isNaN(parsedLimit) ? 10 : parsedLimit, 1), 50);

    const submissions = await Submission.find({ userId })
      .sort({ submissionTime: -1 })
      .limit(limit)
      .populate('problemId', 'title');
    res.json({ success: true, submissions });
  } catch (error) {
    console.error('Fetch recent submissions error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

module.exports = router;