const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import Database Connection
const db = require('./config/db');

const app = express();

// Middleware
app.use(helmet()); // Security Headers
app.use(cors()); // Allow Frontend access
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies

// Test Route
app.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({
      message: 'CryptVault Server is Running 🚀',
      time: result.rows[0].now,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Connection Failed' });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});