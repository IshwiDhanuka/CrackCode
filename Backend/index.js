const express = require('express');
const cors = require("cors");
const axios = require('axios'); 
const Problems = require('./Models/Problems');

const adminRoutes = require('./Routes/admin');
const authRoutes = require('./Routes/auth');
const problemsRoutes = require('./Routes/problems');
const profileRoutes = require('./Routes/profile');
const aiRoutes = require('./Routes/ai');
const submissionsRoutes = require('./Routes/submissions');
require('dotenv').config();

const { DBConnection } = require("./Database/db");

const app = express();

// Logger
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

app.use(cors({
    origin: [
      "https://www.crackcode-judge.online",
      "https://crackcode-judge.online",
      "http://localhost:5173"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"]
  }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mounting routes
app.use('/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemsRoutes);
app.use('/api/user', profileRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/submissions', submissionsRoutes);

// Compiler Proxy Route
app.post('/proxy-run', async (req, res) => {
  try {
    const problem = await Problems.findOne({slug:req.body.slug})
    const testcases = await Testcase.find({problemId:problem.id})
    const response = await axios.post(`${process.env.COMPILER_URL}/run`, {...req.body, ...problem, testcases});
    res.json(response.data);
  } catch (err) {
    console.error("Compiler proxy error:", err);
    res.status(500).json({ error: "Compiler server error" });
  }
});

DBConnection();

app.get("/", (req, res) => {
  res.status(200).json({
    message: 'CrackCode Auth Server is running!',
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}!`);
});

// --- SOCKET.IO SETUP ---
const { Server } = require('socket.io');
const Problems = require('./Models/Problems');
const Testcase = require('./Models/Testcase');
const io = new Server(server, {
  cors: {
    origin: [
      "https://www.crackcode-judge.online",
      "https://crackcode-judge.online",
      "http://localhost:5173"
    ],
    methods: ["GET", "POST"]
  }
});


app.set('io', io); 

module.exports = app;
