function shortenUrl() {
    const longUrl = document.getElementById('longUrl').value;

    const userId = uid; // Get the user ID from the global scope or wherever it's stored

    fetch('https://cosc4p02.tpgc.me/u/shorten', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ longUrl, userId }), // Include userId in the request body
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('ShortResultText').innerHTML = `<a href="${data.shortUrl}" target="_blank">${data.shortUrl}</a>`;
            document.getElementById('counter').innerHTML = `${data.clickCount}`;
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while shortening the URL. Please try again.');
        });
}
