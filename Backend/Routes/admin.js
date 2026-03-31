const express = require("express");
const router = express.Router();
const Problem = require("../Models/Problems");
// FIXED: was importing authMiddleware (which was broken anyway).
// Admin routes must use adminMiddleware so they stay protected after authMiddleware is corrected.
const adminMiddleware = require("../Middleware/adminMiddleware");

router.post("/problems", adminMiddleware, async (req, res) => {
  try {
    const {
      title, slug, description, difficulty, tags,
      constraints, examples, functionName, className,
      arguments: args, returnType
    } = req.body;

    if (!constraints) {
      return res.status(400).json({ success: false, message: "Constraints field is missing." });
    }

    const newProblem = await Problem.create({
      title, slug, description, difficulty, tags,
      constraints, examples, functionName, className,
      arguments: args, returnType
    });

    res.status(201).json({ success: true, problem: newProblem });
  } catch (err) {
    console.error("Creation Error:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
});

router.get("/problems", adminMiddleware, async (req, res) => {
  try {
    const problems = await Problem.find();
    res.status(200).json({ success: true, problems });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/problems/:id", adminMiddleware, async (req, res) => {
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

router.put("/problems/:id", adminMiddleware, async (req, res) => {
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

router.delete("/problems/:id", adminMiddleware, async (req, res) => {
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