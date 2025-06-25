// server/src/middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded     = jwt.verify(token, process.env.JWT_SECRET);
    req.user          = decoded;
    req.clientId      = decoded.clientId;      // ← use this
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
