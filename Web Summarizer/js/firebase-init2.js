// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC6S2JvQ-nt-5truY1-WZXs4vyIBqlccTE",
    authDomain: "cosc4p02.firebaseapp.com",
    projectId: "cosc4p02",
    storageBucket: "cosc4p02.appspot.com",
    messagingSenderId: "507870719627",
    appId: "1:507870719627:web:66bfe94b37c062fd34ee8e",
    measurementId: "G-RTD2M2LPFJ"
  };
  
  // Initialize Firebase
  const app = firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const provider = new firebase.auth.GoogleAuthProvider();
  
  const googleLogin = document.getElementById("google-login-btn");
  
  googleLogin.addEventListener("click", function() {
    firebase.auth().signInWithPopup(provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = firebase.auth.GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        // IdP data available using getAdditionalUserInfo(result)
        // ...
      }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = firebase.auth.GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  });
  