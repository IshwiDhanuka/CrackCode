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

      if (!user.solvedProblems.includes(problemId)) {
        user.solvedProblems.push(problemId);
        user.problemsSolved = user.solvedProblems.length;
        await user.save();
        console.log('  User solvedProblems updated.');
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
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { problemId } = req.query;
    if (!problemId) {
      return res.status(400).json({ success: false, message: 'problemId is required' });
    }
    const submissions = await Submission.find({ userId, problemId }).sort({ submissionTime: -1 });
    res.json({ success: true, submissions });
  } catch (error) {
    console.error('Fetch submissions error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

module.exports = router;
