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


router.post('/', adminMiddleware, async (req, res) => {
  try {
    // Destructure everything including the new fields we added to the frontend
    const { 
      title, slug, description, difficulty, tags, constraints, 
      examples, testcases, functionName, className, arguments: args, returnType 
    } = req.body;

    console.log("Received constraints:", constraints);

    if (!constraints || constraints.trim() === "") {
      return res.status(400).json({ success: false, message: "Constraints are required." });
    }

    // 1. Check for duplicate slug
    const exists = await Problem.findOne({ slug });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Slug already exists' });
    }

    // 2. Create the main Problem document
    // Note: We use 'arguments: args' because 'arguments' is a reserved keyword in JS
    const problem = await Problem.create({ 
      title, slug, description, difficulty, tags, 
      constraints, examples, functionName, className, 
      arguments: args, returnType 
    });

    // 3. Handle the Testcases array
    if (Array.isArray(testcases) && testcases.length > 0) {
      const tcDocs = testcases.map(tc => ({
        problemId: problem._id,
        input: tc.input, // This will contain the 'nums\ntarget' format
        expectedOutput: tc.expectedOutput,
        isSample: tc.isSample || false
      }));
      await Testcase.insertMany(tcDocs);
    }

    // 4. WebSocket Notification
    const io = req.app.get('io');
    if (io) {
      io.emit('problemAdded', { slug, title, difficulty });
    }

    res.status(201).json({ success: true, message: 'Problem created successfully', problem });
  } catch (err) {
    console.error('Create problem error:', err);
    // Send the actual error message back so we can see it in the frontend console
    res.status(500).json({ success: false, message: err.message });
  }
});
//  Update a problem 
router.put('/:slug', adminMiddleware, async (req, res) => {
  try {
    const { title, description, difficulty, tags, constraints, examples, testcases, functionName, className, arguments: args, returnType } = req.body;

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

    const pid = problemId.toString();
    const problem = await Problem.findById(problemId);
    console.log('Problem difficulty:', problem ? problem.difficulty : 'undefined', 'for problemId:', problemId);
    if (!user.solvedProblems.includes(pid)) {
      user.solvedProblems.push(pid);
      user.problemsSolved = user.solvedProblems.length;
      // Award points based on problem difficulty
      let pointsToAdd = 0;
      if (problem && problem.difficulty === 'Easy') pointsToAdd = 10;
      else if (problem && problem.difficulty === 'Medium') pointsToAdd = 20;
      else if (problem && problem.difficulty === 'Hard') pointsToAdd = 30;
      console.log('Points to add:', pointsToAdd, 'Current user points:', user.points);
      user.points = (user.points || 0) + pointsToAdd;
      await user.save();
    }

    res.json({ success: true, message: 'User progress updated' });
  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
