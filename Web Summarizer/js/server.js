const express = require('express');
const cors = require('cors');
const shortid = require('shortid');
const sqlite3 = require('sqlite3');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const path = require('path');
const dbPath = path.resolve(__dirname, 'url_shortener.db');
const db = new sqlite3.Database(dbPath);

db.run(`
  CREATE TABLE IF NOT EXISTS urls (
    id INTEGER PRIMARY KEY,
    shortCode TEXT UNIQUE,
    longUrl TEXT UNIQUE,
    clickCount INTEGER DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    userId TEXT
  )
`);

app.post('/shorten', (req, res) => {
    const { longUrl, userId } = req.body;

    if (!longUrl || !userId) {
        return res.status(400).json({ error: 'Long URL and user ID are required' });
    }

    db.get('SELECT shortCode, clickCount FROM urls WHERE longUrl = ?', [longUrl], (err, row) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (row) {
            const shortUrl = `https://cosc4p02.tpgc.me/u/${row.shortCode}`;
            res.json({ shortUrl, clickCount: row.clickCount });
        } else {
            const shortCode = shortid.generate();

            db.run('INSERT INTO urls (shortCode, longUrl, clickCount, userId) VALUES (?, ?, 1, ?)', [shortCode, longUrl, userId], (err) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                const shortUrl = `https://cosc4p02.tpgc.me/u/${shortCode}`;
                res.json({ shortUrl, clickCount: 1 });
            });
        }
    });
});

app.get('/:shortCode', (req, res) => {
    const { shortCode } = req.params;

    db.get('SELECT longUrl, clickCount FROM urls WHERE shortCode = ?', [shortCode], (err, row) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (!row) {
            return res.status(404).json({ error: 'Short URL not found' });
        }

        const updatedClickCount = row.clickCount + 1;
        db.run('UPDATE urls SET clickCount = ? WHERE shortCode = ?', [updatedClickCount, shortCode], (err) => {
            if (err) {
                console.error('Database error:', err);
            }
        });

        res.redirect(row.longUrl);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
