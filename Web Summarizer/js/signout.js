import { signOut } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-auth.js";
import {auth} from './firebase-init.js';

signOut(auth).then(() => {
  // Sign-out successful.
}).catch((error) => {
  // An error happened.
});
