const express = require('express');
const cors = require('cors');
const shortid = require('shortid');
const sqlite3 = require('sqlite3');

const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());

// Create and connect to the SQLite database
const db = new sqlite3.Database('url_shortener.db');

// Create the 'urls' table if it doesn't already exist
db.run(`
  CREATE TABLE IF NOT EXISTS urls (
    id INTEGER PRIMARY KEY,
    shortCode TEXT UNIQUE,
    longUrl TEXT UNIQUE,
    clickCount INTEGER DEFAULT 0 
  )
`);

// Endpoint to create a short URL
app.post('/shorten', (req, res) => {
    const { longUrl } = req.body;

    if (!longUrl) {
        return res.status(400).json({ error: 'Long URL is required' });
    }

    // Check if the long URL already exists in the database
    db.get('SELECT shortCode, clickCount FROM urls WHERE longUrl = ?', [longUrl], (err, row) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (row) {
            // If the long URL exists, return the existing short URL and click count
            const shortUrl = `${baseUrl}/${row.shortCode}`;
            res.json({ shortUrl, clickCount: row.clickCount });
        } else {
            // Generate a unique short code using shortid
            const shortCode = shortid.generate();

            // Insert the new URL into the database with click count initialized to 1
            db.run('INSERT INTO urls (shortCode, longUrl, clickCount) VALUES (?, ?, 1)', [shortCode, longUrl], (err) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                const shortUrl = `${baseUrl}/${shortCode}`;
                res.json({ shortUrl, clickCount: 1 });
            });
        }
    });
});

// Endpoint to redirect to the original URL
app.get('/:shortCode', (req, res) => {
    const { shortCode } = req.params;

    // Increment click count when redirecting
    db.run('UPDATE urls SET clickCount = clickCount + 1 WHERE shortCode = ?', [shortCode], (err) => {
        if (err) {
            console.error('Database error:', err);
        }
    });

    // Retrieve the long URL and perform the redirect
    db.get('SELECT longUrl FROM urls WHERE shortCode = ?', [shortCode], (err, row) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (!row) {
            return res.status(404).json({ error: 'Short URL not found' });
        }

        res.redirect(row.longUrl);
    });
});

// Start the server
// Start the server
app.listen(PORT, () => {
    const baseUrl = `https://cosc4p02.tpgc.me:${PORT}`; // Replace this with your actual server hostname
    console.log(`Server is running on ${baseUrl}`);
});

