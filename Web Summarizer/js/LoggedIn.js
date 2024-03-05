window.onload = function() {
    google.accounts.id.initialize({
        client_id: "154683893503-4kl342nrqrc358it9epf4dqip0pckf4d.apps.googleusercontent.com",
        callback: function(response) {
            if (response.credential) {
                var profile = response.getBackchannelPayload().profile;
                document.getElementById('greeting').innerText = "Hello, " + profile.name + "!";
                console.log('User is signed in.');
            } else {
                // User is not signed in.
                console.log('User is not signed in.');
            }
        }
    });
   // google.accounts.id.prompt();
}