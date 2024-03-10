import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-auth.js";

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