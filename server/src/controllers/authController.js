const pool = require('../config/db');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../.env' }); 


exports.register = async (req, res) => {

  const { email, password } = req.body;

  try {

    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await argon2.hash(password);

    const userSalt = Math.random().toString(36).substring(2, 15);

    const newUser = await pool.query(
      'INSERT INTO users (email, password_hash, salt) VALUES ($1, $2, $3) RETURNING id, email, created_at',
      [email, hashedPassword, userSalt]
    );

    const token = jwt.sign(
      { userId: newUser.rows[0].id }, 
      process.env.JWT_SECRET,         
      { expiresIn: '1h' }             
    );

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


exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
   
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

 
    const isMatch = await argon2.verify(user.password_hash, password);
    
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        salt: user.salt 
      },
      token
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error during login' });
  }
};