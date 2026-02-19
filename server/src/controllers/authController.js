const pool = require('../config/db');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../.env' }); // Load secrets

// 1. REGISTER USER
exports.register = async (req, res) => {
  // Get data from the frontend (Postman for now)
  const { email, password } = req.body;

  try {
    // A. Check if user already exists
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // B. Hash the password (Argon2id)
    // Argon2 automatically generates a random "Salt" for us.
    // This makes it impossible to use "Rainbow Tables" to crack it.
    const hashedPassword = await argon2.hash(password);

    // C. Generate a Random Salt for the User (Used for Client-Side Encryption later)
    // We use a simple random string for now.
    const userSalt = Math.random().toString(36).substring(2, 15);

    // D. Save to Database
    const newUser = await pool.query(
      'INSERT INTO users (email, password_hash, salt) VALUES ($1, $2, $3) RETURNING id, email, created_at',
      [email, hashedPassword, userSalt]
    );

    // E. Generate a JWT Token (The "Session Card")
    // This allows the user to stay logged in.
    const token = jwt.sign(
      { userId: newUser.rows[0].id }, // Payload
      process.env.JWT_SECRET,         // Secret Key (from .env)
      { expiresIn: '1h' }             // Expires in 1 hour
    );

    // F. Send Success Response
    res.status(201).json({
      message: 'User registered successfully',
      user: newUser.rows[0],
      token
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// 2. LOGIN USER
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // A. Find the user in the database
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    // If user doesn't exist, return a generic error
    // Security tip: Never say "Email not found" vs "Wrong password". 
    // Just say "Invalid credentials" so hackers can't guess valid emails.
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // B. Verify the password using Argon2
    // Argon2 automatically extracts the salt from the hash and compares them
    const isMatch = await argon2.verify(user.password_hash, password);
    
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // C. Generate a new JWT Token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // D. Send Success Response (DO NOT send the password hash back!)
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        salt: user.salt // We will need this salt later for the frontend crypto!
      },
      token
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error during login' });
  }
};