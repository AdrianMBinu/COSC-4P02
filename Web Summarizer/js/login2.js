document.addEventListener("DOMContentLoaded", function() {
    var cachedToken = localStorage.getItem('authToken');
    var elements = document.querySelectorAll(".signoutPage");
    var signout = document.querySelectorAll(".confirmation");
    var logButton = document.querySelectorAll(".loginButton");

    if (cachedToken === null) {
        console.log('Signout');

        elements.forEach(function(element) {
            element.style.display = "flex";
        });
        signout.forEach(function(sign) {
            sign.style.display = "none";
        });
        logButton.forEach(function(log) {
            log.textContent = 'LOGIN';
        });
    } else {

        elements.forEach(function(element) {
            element.style.display = "none";
        });
        signout.forEach(function(sign) {
            sign.style.display = "flex";
        });
        logButton.forEach(function(log) {
            log.textContent = 'SIGNOUT';
        });
    }//Restrict Pro features and Chnage login/signout button
    
});