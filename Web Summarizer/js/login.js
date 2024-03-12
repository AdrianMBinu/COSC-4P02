import {auth, provider} from './firebase-init.js';
import {signInWithPopup} from "https://www.gstatic.com/firebasejs/9.6.6/firebase-auth.js";

const googleLogin=document.getElementById("google-login-btn");
googleLogin.addEventListener("click", function(){
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        // IdP data available using getAdditionalUserInfo(result)
        setTimeout(redirect, 2000);
        // ...
      }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
    })

    function redirect(){
      window.location.href = "https://cosc4p02.tpgc.me/index.html";
  }
    