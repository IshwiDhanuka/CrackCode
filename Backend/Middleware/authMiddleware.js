const jwt = require('jsonwebtoken');
const User = require('../Models/User');

const adminMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY); 
    const user = await User.findById(decoded.id); 

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
    }

    req.user = user; 
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

module.exports = adminMiddleware;
