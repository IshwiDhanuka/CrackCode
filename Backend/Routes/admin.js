const express = require("express");
const router = express.Router();
const Problem = require("../Models/Problems");
const authMiddleware = require("../Middleware/authMiddleware");

// Create a new problem
router.post("/problems", authMiddleware, async (req, res) => {
  try {
    const newProblem = await Problem.create(req.body);
    res.status(201).json({ 
        success: true,
        problem: newProblem });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Get all problems
router.get("/problems", authMiddleware, async (req, res) => {
  try {
    const problems = await Problem.find();
    res.status(200).json({ success: true, problems });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get a specific problem by ID
router.get("/problems/:id", authMiddleware, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ success: false, message: "Problem not found" });
    }
    res.status(200).json({ success: true, problem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update a problem
router.put("/problems/:id", authMiddleware, async (req, res) => {
  try {
    const updatedProblem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProblem) {
      return res.status(404).json({ success: false, message: "Problem not found" });
    }
    res.status(200).json({ success: true, problem: updatedProblem });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Delete a problem
router.delete("/problems/:id", authMiddleware, async (req, res) => {
  try {
    const deletedProblem = await Problem.findByIdAndDelete(req.params.id);
    if (!deletedProblem) {
      return res.status(404).json({ success: false, message: "Problem not found" });
    }
    res.status(200).json({ success: true, message: "Problem deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
