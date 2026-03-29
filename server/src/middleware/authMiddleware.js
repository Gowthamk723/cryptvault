const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../../.env' });

module.exports = (req, res, next) => {

  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = verified; 
    next(); 
  } catch (err) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};