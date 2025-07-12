const express = require('express');
const cors = require("cors");
const adminRoutes = require('../Routes/admin');
const authRoutes = require('../Routes/auth');
const problemsRoutes = require('../Routes/problems');

require('dotenv').config();

const { DBConnection } = require("../Database/db");

const app = express();

// Logger
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemsRoutes);

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
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.set('io', io); // Make io available to routes

module.exports = app;
