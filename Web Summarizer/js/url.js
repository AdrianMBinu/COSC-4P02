function shortenUrl() {
    const longUrl = document.getElementById('longUrl').value;

    const userId = window.globalVariable;

    fetch('https://cosc4p02.tpgc.me/u/shorten', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ longUrl, userId }),
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('ShortResultText').innerHTML = `<a href="${data.shortUrl}" target="_blank">${data.shortUrl}</a>`;
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while shortening the URL. Please try again.');
        });
    }