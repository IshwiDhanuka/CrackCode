require('dotenv').config();
const express = require('express');
const axios = require('axios');
const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=' + GEMINI_API_KEY;
// Helper to call Gemini
async function callGemini(prompt) {
  const res = await axios.post(GEMINI_URL, {
    contents: [{ parts: [{ text: prompt }] }]
  });
  return res.data.candidates[0].content.parts[0].text;
}

// AI Review endpoint
router.post('/review', async (req, res) => {
  const { code, problem } = req.body;
  const prompt = `You are a code reviewer. Review the following code for the problem described and give feedback:\n\nProblem:\n${problem}\n\nCode:\n${code}`;
  try {
    const review = await callGemini(prompt);
    res.json({ review });
  } catch (err) {
    console.error('AI review failed:', err, err?.response?.data);
    res.status(500).json({ error: 'AI review failed', details: err.message });
  }
});

// AI Hint endpoint
router.post('/hint', async (req, res) => {
  const { problem } = req.body;
  const prompt = `You are a coding assistant. Give a helpful hint for the following problem, but do not give the full solution:\n\nProblem:\n${problem}`;
  try {
    const hint = await callGemini(prompt);
    res.json({ hint });
  } catch (err) {
    console.error('AI hint failed:', err, err?.response?.data);
    res.status(500).json({ error: 'AI hint failed', details: err.message });
  }
});

module.exports = router; 