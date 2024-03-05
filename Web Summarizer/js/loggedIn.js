function checkSignInStatus() {
    var auth2 = gapi.auth2.getAuthInstance();
    if (auth2.isSignedIn.get()) {
        console.log('User is signed in.');
        var profile = auth2.currentUser.get().getBasicProfile();
    } else {
        console.log('User is not signed in.');
    }
}

function onLoad() {
    gapi.load('auth2', function() {
        gapi.auth2.init({
            client_id: 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com',
        }).then(function(auth2) {
            // Listen for sign-in state changes.
            auth2.isSignedIn.listen(checkSignInStatus);
            // Handle the initial sign-in state.
            checkSignInStatus();
        });
    });
}
// Load the Google Sign-In API on load
//onLoad();
