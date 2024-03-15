import { signOut } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-auth.js";
import {auth} from './firebase-init.js';

const googleSignOut=document.getElementById("google-signout-btn");
googleSignOut.addEventListener("click", function(){
signOut(auth).then(() => {
  window.location.href = "https://cosc4p02.tpgc.me/index.html";
}).catch((error) => {
  // An error happened.
});
})