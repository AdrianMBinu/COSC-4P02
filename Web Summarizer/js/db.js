// database.js

const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: 'sc.on.underlying.skynet.tpgc.me',
    user: 'cosc4p02',
    password: 'summarizeme',
    database: '4P02Test',
    connectionLimit: 5,
});

async function storeUrl(longUrl, shortCode) {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query('INSERT INTO urls (longUrl, shortCode) VALUES (?, ?)', [longUrl, shortCode]);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.end();
    }
}

async function getLongUrl(shortCode) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT longUrl FROM urls WHERE shortCode = ?', [shortCode]);
        if (rows.length > 0) {
            return rows[0].longUrl;
        } else {
            return null;
        }
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.end();
    }
}

module.exports = { storeUrl, getLongUrl };
