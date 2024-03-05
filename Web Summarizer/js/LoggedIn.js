// This function will run when the page loads
function init() {
    // Load the Google Sign-In library
    gapi.load('auth2', function() {
      // Initialize the Google auth library
      const auth2 = gapi.auth2.init({
        client_id: '154683893503-4kl342nrqrc358it9epf4dqip0pckf4d.apps.googleusercontent.com',
      });
  
      // Check if the user is signed in
      if (auth2.isSignedIn.get()) {
        const profile = auth2.currentUser.get().getBasicProfile();
        console.log('User is signed in:', profile.getName());
        document.getElementById('greeting').innerText = "Hello, " + profile.getName() + "!";
            // Show the hidden div
      } else {
        console.log('User is not signed in.');
      }
    });
  };