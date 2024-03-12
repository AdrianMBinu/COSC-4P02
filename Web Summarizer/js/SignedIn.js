import {onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-auth.js";
  import { auth } from './js/firebase-init.js';
  window.onload = function() {
    onAuthStateChanged(auth, (user) => {
        var elements = document.querySelectorAll(".Proffesional");
        var logButton = document.querySelectorAll(".loginButton");
        if (user) {
            const uid = user.uid;
            document.getElementById("greeting").innerText = `Hello, ${user.displayName || 'User'}`;
            
            elements.forEach(function(element) {
                element.style.display = "flex";
            });
            logButton.forEach(function(log) {
                log.textContent = 'SIGNOUT';
            });
        } else {
            // User is signed out
            elements.forEach(function(element) {
                element.style.display = "none";
            });
            logButton.forEach(function(log) {
                log.textContent = 'LOGIN';
            });
        }
    });
};