const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
  try {
    const auth = req.header('Authorization');
    const token = auth && auth.startsWith('Bearer ') ? auth.replace('Bearer ', '') : null;
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  next();
};
