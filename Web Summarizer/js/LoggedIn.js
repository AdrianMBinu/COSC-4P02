// This function will run when the page loads
window.onload = function() {
    // Load the Google Sign-In library
    gapi.load('auth2', function() {
      // Initialize the Google auth library
      const auth2 = gapi.auth2.init({
        client_id: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
      });
  
      // Check if the user is signed in
      if (auth2.isSignedIn.get()) {
        const profile = auth2.currentUser.get().getBasicProfile();
        console.log('User is signed in:', profile.getName());
      } else {
        console.log('User is not signed in.');
      }
    });
  };