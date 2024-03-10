import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-app.js";

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
  const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
// Function to check if the user is signed in already
export function checkIfUserSignedIn() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      console.log("User is signed in:", user);
      document.getElementById("greeting").innerText = `Hello, ${user.displayName || 'User'}`;
    } else {
      // No user is signed in
      console.log("No user signed in");
    }
  });
}