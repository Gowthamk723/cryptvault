const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config({ path: '../.env' });
const db = require('./config/db');
const { initializeMinio } = require('./config/minio');
const fileRoutes = require('./routes/fileRoutes');
const authRoutes = require('./routes/authRoutes');


const app = express();

initializeMinio();

app.use(helmet()); 
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true, 
  exposedHeaders: ['x-file-name', 'x-encryption-iv', 'x-file-key'] 
})); 
app.use(morgan('dev')); 
app.use(express.json()); 

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);


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