const express = require('express');
const cors = require('cors');
const shortid = require('shortid');
const mariadb = require('mariadb');

const app = express();
const PORT = 3000;
const HOST = 'cosc4p02.tpgc.me'; // Specify the host here

app.use(cors());
app.use(express.json());

// Create a pool of database connections
const pool = mariadb.createPool({
    host: 'sc.on.underlying.skynet.tpgc.me',
    user: 'cosc4p02',
    password: 'summarizeme',
    database: '4P02Test',
    connectionLimit: 5 // Adjust according to your needs
});

// Endpoint to create a short URL
app.post('/shorten', async (req, res) => {
    const { longUrl } = req.body;

    if (!longUrl) {
        return res.status(400).json({ error: 'Long URL is required' });
    }

    let conn;
    try {
        conn = await pool.getConnection();

        // Check if the long URL already exists in the database
        const rows = await conn.query('SELECT shortCode, clickCount FROM urls WHERE longUrl = ?', [longUrl]);

        if (rows.length > 0) {
            // If the long URL exists, return the existing short URL and click count
            const shortUrl = `http://yourdomain.com/${rows[0].shortCode}`;
            res.json({ shortUrl, clickCount: rows[0].clickCount });
        } else {
            // Generate a unique short code using shortid
            const shortCode = shortid.generate();

            // Insert the new URL into the database with click count initialized to 1
            await conn.query('INSERT INTO urls (shortCode, longUrl, clickCount) VALUES (?, ?, 1)', [shortCode, longUrl]);

            const shortUrl = `http://yourdomain.com/${shortCode}`;
            res.json({ shortUrl, clickCount: 1 });
        }
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (conn) conn.release(); // release connection back to pool
    }
});

// Endpoint to redirect to the original URL
app.get('/:shortCode', async (req, res) => {
    const { shortCode } = req.params;

    let conn;
    try {
        conn = await pool.getConnection();

        // Increment click count when redirecting
        await conn.query('UPDATE urls SET clickCount = clickCount + 1 WHERE shortCode = ?', [shortCode]);

        // Retrieve the long URL and perform the redirect
        const rows = await conn.query('SELECT longUrl FROM urls WHERE shortCode = ?', [shortCode]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Short URL not found' });
        }

        res.redirect(rows[0].longUrl);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (conn) conn.release(); // release connection back to pool
    }
});

// Start the server
app.listen(PORT, HOST, () => {
    console.log(`Server is running on https://${HOST}:${PORT}`);
});