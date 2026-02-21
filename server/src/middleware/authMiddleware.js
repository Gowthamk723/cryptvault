const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../../.env' }); // Note the two sets of dots to go up two folders

module.exports = (req, res, next) => {
  // 1. Get the token from the header
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  // 2. Check if it's a valid Bearer token
  const token = authHeader.replace('Bearer ', '');
  
  try {
    // 3. Verify the token using our secret key
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Attach the user info to the request and let them through!
    req.user = verified; // Contains { userId: ... }
    next(); 
  } catch (err) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};