const express = require("express");
const router = express.Router();
const Problem = require("../Models/Problems");
const authMiddleware = require("../Middleware/authMiddleware");

router.post("/problems", authMiddleware, async (req, res) => {
  try {
    // 1. Destructure to ensure every field is present
    const { 
      title, slug, description, difficulty, tags, 
      constraints, examples, functionName, className, 
      arguments: args, returnType 
    } = req.body;

    // 2. Manual check (Extra safety)
    if (!constraints) {
        return res.status(400).json({ success: false, message: "Constraints field is missing in the request." });
    }

    // 3. Create using the explicit variables
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
