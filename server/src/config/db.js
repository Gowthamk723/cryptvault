const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

// Create a connection pool (better performance than single client)
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

// Test the connection immediately
// Test the connection exactly ONCE at startup
pool.query('SELECT 1')
  .then(() => console.log('✅ Connected to PostgreSQL Database'))
  .catch((err) => console.error('❌ PostgreSQL Connection Error:', err));

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};

module.exports = {
  query: (text, params) => pool.query(text, params),
};