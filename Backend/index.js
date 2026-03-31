require('dotenv').config(); 
const express = require('express');
const cors = require("cors");
const axios = require('axios'); 


const Problems = require('./Models/Problems');
const Testcase = require('./Models/Testcase');
const adminRoutes = require('./Routes/admin');
const authRoutes = require('./Routes/auth');
const problemsRoutes = require('./Routes/problems');
const profileRoutes = require('./Routes/profile');
const aiRoutes = require('./Routes/ai');
const submissionsRoutes = require('./Routes/submissions');

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
      "http://localhost:5173",
      "https://crack-code-xi.vercel.app"
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

app.post('/run', async (req, res) => {
  try {
    const { slug, code, language } = req.body;
    
    // 1. Log the URL to verify .env is actually loading
    console.log(`[RUN] Connecting to: ${process.env.COMPILER_URL}/run`);

    if (!slug) return res.status(400).json({ error: "Missing 'slug'" });

    const problem = await Problems.findOne({ slug });
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    const testcases = await Testcase.find({ problemId: problem._id });
    console.log(`Sending ${testcases.length} test cases to Compiler...`);

    // 2. The Axios Request
    const response = await axios.post(`${process.env.COMPILER_URL}/run`, { 
        code,
        language: language || 'cpp',
        className: problem.className || 'Solution',
        functionName: problem.functionName,
        testcases,
        arguments: problem.arguments,
        returnType: problem.returnType
    }, { 
        timeout: 45000, // Bumped to 45s - AWS cold starts + TLE logic need time
        headers: {
            'Content-Type': 'application/json',
            'Accept-Encoding': 'identity' // Prevents issues with gzipped responses
        }
    }); 

    console.log("Compiler responded successfully");
    res.json(response.data);

  } catch (err) {
    console.error(" COMPILER PROXY ERROR:");

    if (err.code === 'ECONNABORTED') {
       console.error("TIMEOUT: AWS took > 45 seconds.");
       return res.status(504).json({ error: "Compiler Timeout" });
    }

    if (err.response) {
      console.error("Status:", err.response.status);
      res.status(err.response.status).json(err.response.data);
    } else {
      console.error("Error Message:", err.message);
      res.status(503).json({ error: "Compiler unreachable", details: err.message });
    }
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


const io = new Server(server, {
  cors: {
    origin: [
      "https://www.crackcode-judge.online",
      "https://crackcode-judge.online",
      "http://localhost:5173",
      "https://crack-code-xi.vercel.app"
    ],
    methods: ["GET", "POST"]
  }
});


app.set('io', io); 

module.exports = app;
