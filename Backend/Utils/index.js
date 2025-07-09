const express = require('express');
const cors = require("cors");
const adminRoutes = require('../Routes/admin');
const authRoutes = require('../Routes/auth');

require('dotenv').config();

const { DBConnection } = require("../Database/db");

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/admin', adminRoutes);
app.use('/', authRoutes);

// Logger
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
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
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}!`);
});
