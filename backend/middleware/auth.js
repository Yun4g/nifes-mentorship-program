import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header

    if (!token) {
      return res.status(401).json({ message: 'No token provided. Authorization denied.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    req.user = await User.findById(decoded.id).select('-password'); // Attach user to request

    if (!req.user) {
      return res.status(401).json({ message: 'User not found. Authorization denied.' });
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message); // Log error message
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token. Authorization denied.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please log in again.' });
    }
    res.status(500).json({ message: 'Server error. Authorization denied.' });
  }
};