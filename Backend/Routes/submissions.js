const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authMiddleware = require('../Middleware/authMiddleware');
const Submission = require('../Models/Submissions');
const User = require('../Models/User');


router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { problemId, status, language, code } = req.body;

    console.log('[CrackCode] ➤ New submission request:', {
      userId, problemId, status, language
    });

    // Validate request body
    if (!problemId || !status || !language || !code) {
      return res.status(400).json({
        success: false,
        message: 'All fields (problemId, status, language, code) are required.'
      });
    }

    // Save new submission
    const submission = new Submission({
      userId,
      problemId,
      status,
      language,
      code,
      submissionTime: new Date()
    });

    await submission.save();
    console.log('Submission saved:', submission._id);

    // Update solvedProblems if status is "Accepted"
    if (status === 'Accepted') {
      const user = await User.findById(userId);
      const problem = await mongoose.model('Problem').findById(problemId);
      const pid = problemId.toString();
      console.log('Problem difficulty:', problem ? problem.difficulty : 'undefined', 'for problemId:', problemId);
      if (!user.solvedProblems.includes(pid)) {
        user.solvedProblems.push(pid);
        user.problemsSolved = user.solvedProblems.length;
        // Award points based on problem difficulty
        let pointsToAdd = 0;
        if (problem.difficulty === 'Easy') pointsToAdd = 10;
        else if (problem.difficulty === 'Medium') pointsToAdd = 20;
        else if (problem.difficulty === 'Hard') pointsToAdd = 30;
        console.log('Points to add:', pointsToAdd, 'Current user points:', user.points);
        user.points = (user.points || 0) + pointsToAdd;
        await user.save();
        console.log('  User solvedProblems and points updated.');
      }
    }

    res.status(201).json({
      success: true,
      message: 'Submission recorded successfully.',
      submissionId: submission._id
    });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// Get all submissions for a user and problem
router.get('/', async (req, res) => {
  console.log('Submissions route hit', req.query);
  try {
    // const userId = req.user._id; // Not using auth for debugging
    const { problemId } = req.query;
    if (!problemId) {
      return res.status(400).json({ success: false, message: 'problemId is required' });
    }
    const submissions = await Submission.find({ problemId }).sort({ submissionTime: -1 });
    res.json({ success: true, submissions });
  } catch (error) {
    console.error('Fetch submissions error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// Get recent submissions for a user
router.get('/recent', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;
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
