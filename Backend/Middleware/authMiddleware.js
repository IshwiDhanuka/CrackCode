const jwt = require('jsonwebtoken');
const User = require('../Models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY); // ✅ SECRET_KEY matches your env
    const user = await User.findById(decoded.id); // ✅ match the key you signed with

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    next(); // ✅ move to next route/controller
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
