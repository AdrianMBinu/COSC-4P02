window.onload = function() {
    google.accounts.id.initialize({
        client_id: "154683893503-4kl342nrqrc358it9epf4dqip0pckf4d.apps.googleusercontent.com",
        callback: function(response) {
            if (response.hasOauthToken()) {
                var profile = google.accounts.id.getBasicProfile();
                document.getElementById('greeting').innerText = "Hello, " + profile.getName() + "!";
                console.log('User is signed in.');
            } else {
                // User is not signed in.
                console.log('User is not signed in.');
            }
        }
    });
    google.accounts.id.prompt(); // This will trigger the Google One Tap prompt.
}