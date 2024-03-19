import {onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-auth.js";
import { auth } from './js/firebase-init.js';
var uid=null;
export function user() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
             uid = user.uid;
        } else {
            uid=null;
        }
    });
};

export { uid };