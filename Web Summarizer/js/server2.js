const express = require('express');
const cors = require('cors');
const shortid = require('shortid');
const mysql = require('mysql');

const app = express();

app.use(cors());
app.use(express.json());
const PORT = 3000;

// Create a MySQL connection pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'your_host',
  user: 'your_username',
  password: 'your_password',
  database: 'your_database'
});

// Create the urls table if not exists
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS urls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shortCode VARCHAR(255) UNIQUE,
    longUrl TEXT UNIQUE,
    clickCount INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    userId VARCHAR(255)
  )
`;

pool.query(createTableQuery, (err, result) => {
  if (err) {
    console.error('Database error:', err);
  } else {
    console.log('Urls table created or already exists');
  }
});

// API endpoint to shorten a URL
app.post('/shorten', (req, res) => {
  const { longUrl, userId } = req.body;

  if (!longUrl || !userId) {
    return res.status(400).json({ error: 'Long URL and user ID are required' });
  }

  const shortCode = shortid.generate();

  const insertQuery = 'INSERT INTO urls (shortCode, longUrl, clickCount, userId) VALUES (?, ?, 1, ?)';
  const values = [shortCode, longUrl, userId];

  pool.query(insertQuery, values, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const shortUrl = `https://cosc4p02.tpgc.me/u/${shortCode}`;
    res.json({ shortUrl, clickCount: 1 });
  });
});

// API endpoint to redirect to the original URL
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  const selectQuery = 'SELECT longUrl FROM urls WHERE shortCode = ?';
  const values = [shortCode];

  pool.query(selectQuery, values, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    const longUrl = result[0].longUrl;
    res.redirect(longUrl);
  });
});

// API endpoint to get all URLs
app.post('/urls', (req, res) => {
  const selectAllQuery = 'SELECT * FROM urls';

  pool.query(selectAllQuery, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    res.json(result);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
