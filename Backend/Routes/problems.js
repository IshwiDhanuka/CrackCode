const express = require('express');
const router = express.Router();

const Problem = require('../Models/Problems');
const Testcase = require('../Models/Testcase');
const User = require('../Models/User');

const authMiddleware = require('../Middleware/authMiddleware');
const adminMiddleware = require('../Middleware/adminMiddleware');

//  Get total count of problems
router.get('/total-count', async (req, res) => {
  try {
    const total = await Problem.countDocuments();
    res.json({ success: true, totalProblems: total });
  } catch (err) {
    console.error('Error getting problem count:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

//  Get all problems (basic info)
router.get('/', async (req, res) => {
  try {
    const problems = await Problem.find().select('title slug difficulty tags').sort({ createdAt: -1 });
    res.json({ success: true, problems });
  } catch (err) {
    console.error('Error fetching problems:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

//  Get full problem + testcases by slug
router.get('/:slug', async (req, res) => {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug });
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    const testcases = await Testcase.find({ problemId: problem._id }).select('-__v -problemId');
    res.json({ success: true, problem, testcases });
  } catch (err) {
    console.error('Error fetching problem:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add a new problem 
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const { title, slug, description, difficulty, tags, constraints, examples, testcases } = req.body;

    const exists = await Problem.findOne({ slug });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Slug already exists' });
    }

    const problem = await Problem.create({ title, slug, description, difficulty, tags, constraints, examples });

    if (Array.isArray(testcases)) {
      const tcDocs = testcases.map(tc => ({
        problemId: problem._id,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isSample: tc.isSample || false
      }));
      await Testcase.insertMany(tcDocs);
    }

    // Emit websocket event for new problem
    const io = req.app.get('io');
    if (io) {
      io.emit('problemAdded', { slug, title, difficulty });
    }

    res.status(201).json({ success: true, message: 'Problem created', problem });
  } catch (err) {
    console.error('Create problem error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

//  Update a problem 
router.put('/:slug', adminMiddleware, async (req, res) => {
  try {
    const { title, description, difficulty, tags, constraints, examples, testcases } = req.body;

    const problem = await Problem.findOneAndUpdate(
      { slug: req.params.slug },
      { title, description, difficulty, tags, constraints, examples },
      { new: true }
    );

    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    await Testcase.deleteMany({ problemId: problem._id });

    if (Array.isArray(testcases)) {
      const tcDocs = testcases.map(tc => ({
        problemId: problem._id,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isSample: tc.isSample || false
      }));
      await Testcase.insertMany(tcDocs);
    }

    res.json({ success: true, message: 'Problem updated', problem });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

//  Delete a problem 
router.delete('/:slug', adminMiddleware, async (req, res) => {
  try {
    const deleted = await Problem.findOneAndDelete({ slug: req.params.slug });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    await Testcase.deleteMany({ problemId: deleted._id });

    res.json({ success: true, message: 'Problem deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

//  After user solves a problem (auth required)
router.post('/submit/:problemId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { problemId } = req.params;

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.solvedProblems.includes(problemId)) {
      user.solvedProblems.push(problemId);
      user.problemsSolved = user.solvedProblems.length;
      await user.save();
    }

    res.json({ success: true, message: 'User progress updated' });
  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
