// URL shortening logic directly in url.js

// Function to shorten URL
function shortenUrl() {
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
        generateShortUrl(longUrl);
    }
}

// Function to generate short URL
function generateShortUrl(longUrl) {
    // Simulating generation of short code here
    const shortCode = Math.random().toString(36).substring(2, 8); // Random short code

    // Store the short URL in local storage
    const shortUrl = `https://cosc4p02.tpgc.me/${shortCode}`; // Replace with your actual domain
    localStorage.setItem(longUrl, shortUrl);

    // Initialize click count to 0
    localStorage.setItem(`${longUrl}_clickCount`, 0);

    displayShortenedUrl(shortUrl, 0);
}

// Function to display shortened URL and click count
function displayShortenedUrl(shortUrl, clickCount) {
    document.getElementById('shortUrl').innerHTML = `Shortened URL: <a href="${shortUrl}" target="_blank">${shortUrl}</a>`;
    document.getElementById('clickCount').innerHTML = `Click Count: ${clickCount}`;
}
