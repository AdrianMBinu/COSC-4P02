

const { storeUrl, getLongUrl } = require('./db');
// Function to shorten URL
async function shortenUrl() {
    const longUrl = document.getElementById('longUrl').value;

    if (!longUrl) {
        alert('Long URL is required');
        return;
    }

    // Check if the long URL already exists
    const existingShortUrl = localStorage.getItem(longUrl);
    if (existingShortUrl) {
        const clickCount = localStorage.getItem(`${longUrl}_clickCount`) || 0;
        displayShortenedUrl(existingShortUrl, clickCount);
    } else {
        // Generate short URL and store in the database
        const shortUrl = await generateShortUrl(longUrl);
        displayShortenedUrl(shortUrl, 0);
    }
}

// Function to generate short URL
async function generateShortUrl(longUrl) {
    const response = await fetch('http://localhost:3000/shorten', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ longUrl }),
    });

    const data = await response.json();
    return data.shortUrl;
}

// Function to display shortened URL and click count
function displayShortenedUrl(shortUrl, clickCount) {
    document.getElementById('shortUrl').innerHTML = `Shortened URL: <a href="${shortUrl}" target="_blank">${shortUrl}</a>`;
    document.getElementById('clickCount').innerHTML = `Click Count: ${clickCount}`;
}

// Function to handle redirection
async function redirectToLongUrl(shortCode) {
    const response = await fetch(`http://localhost:3000/${shortCode}`);
    if (response.ok) {
        const longUrl = await response.text();
        window.location.href = longUrl;
    } else {
        console.error('Failed to redirect:', response.status);
        alert('Failed to redirect to the original URL.');
    }
}

// Call redirectToLongUrl function if the page is accessed with a short URL
if (window.location.pathname !== '/') {
    const shortCode = window.location.pathname.substring(1);
    redirectToLongUrl(shortCode);
}
