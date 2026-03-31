const express = require('express');
const router = express.Router();

const Problem = require('../Models/Problems');
const Testcase = require('../Models/Testcase');

const adminMiddleware = require('../Middleware/adminMiddleware');

// Get total count of problems
router.get('/total-count', async (req, res) => {
  try {
    const total = await Problem.countDocuments();
    res.json({ success: true, totalProblems: total });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all problems (basic info — public)
router.get('/', async (req, res) => {
  try {
    const problems = await Problem.find()
      .select('title slug difficulty tags')
      .sort({ createdAt: -1 });
    res.json({ success: true, problems });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get full problem + SAMPLE testcases only by slug (public)
// Hidden testcases are NEVER sent to the client — only used server-side in /run
router.get('/:slug', async (req, res) => {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug });
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    const allTestcases = await Testcase.find({ problemId: problem._id }).select('-__v -problemId');

    // SECURITY: strip input/expectedOutput from hidden testcases before sending to client
    // Hidden testcases are fetched server-side in /run using the slug, never exposed here
    const safeTestcases = allTestcases.map(tc => {
      if (!tc.isSample) {
        return { _id: tc._id, isSample: false };
      }
      return tc;
    });

    res.json({ success: true, problem, testcases: safeTestcases });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create problem (admin only)
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const {
      title, slug, description, difficulty, tags, constraints,
      examples, testcases, functionName, className, arguments: args, returnType
    } = req.body;

    if (!constraints || constraints.trim() === "") {
      return res.status(400).json({ success: false, message: "Constraints are required." });
    }

    const exists = await Problem.findOne({ slug });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Slug already exists' });
    }

    const problem = await Problem.create({
      title, slug, description, difficulty, tags,
      constraints, examples, functionName, className,
      arguments: args, returnType
    });

    if (Array.isArray(testcases) && testcases.length > 0) {
      const tcDocs = testcases.map(tc => ({
        problemId: problem._id,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isSample: tc.isSample || false
      }));
      await Testcase.insertMany(tcDocs);
    }

    // WebSocket notification
    const io = req.app.get('io');
    if (io) io.emit('problemAdded', { slug, title, difficulty });

    res.status(201).json({ success: true, message: 'Problem created successfully', problem });
  } catch (err) {
    console.error('Create problem error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update problem (admin only)
router.put('/:slug', adminMiddleware, async (req, res) => {
  try {
    const {
      title, description, difficulty, tags, constraints, examples,
      testcases, functionName, className, arguments: args, returnType
    } = req.body;

    const problem = await Problem.findOneAndUpdate(
      { slug: req.params.slug },
      { title, description, difficulty, tags, constraints, examples, functionName, className, arguments: args, returnType },
      { new: true }
    );

    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    await Testcase.deleteMany({ problemId: problem._id });
    if (Array.isArray(testcases) && testcases.length > 0) {
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
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete problem (admin only)
router.delete('/:slug', adminMiddleware, async (req, res) => {
  try {
    const deleted = await Problem.findOneAndDelete({ slug: req.params.slug });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }
    await Testcase.deleteMany({ problemId: deleted._id });
    res.json({ success: true, message: 'Problem deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});



module.exports = router;