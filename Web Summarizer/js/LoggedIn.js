function checkSignInStatus() {
    var auth2 = gapi.auth2.getAuthInstance();
    if (auth2.isSignedIn.get()) {
        console.log('User is signed in.');
        var profile = auth2.currentUser.get().getBasicProfile();
        // Display greeting message with user's name
        document.getElementById('greeting').innerText = "Hello, " + profile.getName() + "!";
        // Show the hidden div
        document.getElementById('loggedInDiv').style.display = "block";
    } else {
        console.log('User is not signed in.');
    }
}

function onLoad() {
    gapi.load('auth2', function() {
        gapi.auth2.init({
            client_id: '154683893503-4kl342nrqrc358it9epf4dqip0pckf4d.apps.googleusercontent.com',
        }).then(function(auth2) {
            auth2.isSignedIn.listen(checkSignInStatus);
            checkSignInStatus();
        });
    });
}
// Load the Google Sign-In API on load
onLoad();
