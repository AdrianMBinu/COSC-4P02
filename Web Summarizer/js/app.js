// document.addEventListener("DOMContentLoaded", function() {
//     var cachedToken = localStorage.getItem('authToken');
//     var elements = document.querySelectorAll(".Proffesional");
//     var logButton = document.querySelectorAll(".loginButton");

//     if (cachedToken === null) {
//         console.log('Signout');

//         elements.forEach(function(element) {
//             element.style.display = "none";
//         });
//         logButton.forEach(function(log) {
//             log.textContent = 'LOGIN';
//         });
//     } else {

//         elements.forEach(function(element) {
//             element.style.display = "flex";
//         });
//         logButton.forEach(function(log) {
//             log.textContent = 'SIGNOUT';
//         });
//     }//Restrict Pro features and Chnage login/signout button
    
// });//moved to seperate Signedin file
function copyToClipboard() {
    var textToCopy = document.getElementById("ShortResultText").innerText;

    var tempTextArea = document.createElement("textarea");
    tempTextArea.value = textToCopy;

    tempTextArea.style.position = "absolute";
    tempTextArea.style.left = "-9999px";

    document.body.appendChild(tempTextArea);

    tempTextArea.select();
    document.execCommand("copy");

    document.body.removeChild(tempTextArea);

}
function copySummary() {
    var textToCopy = document.getElementById("sumResultText").innerText;

    var tempTextArea = document.createElement("textarea");
    tempTextArea.value = textToCopy;

    tempTextArea.style.position = "absolute";
    tempTextArea.style.left = "-9999px";

    document.body.appendChild(tempTextArea);

    tempTextArea.select();
    document.execCommand("copy");

    document.body.removeChild(tempTextArea);

}
function speakText() {
    var inputText = document.getElementById("sumResultText").innerText;

    if ('speechSynthesis' in window) {
        var synthesis = window.speechSynthesis;
        var utterance = new SpeechSynthesisUtterance(inputText)

        synthesis.speak(utterance);
    } else {
        alert("Your browser does not support the SpeechSynthesis API.");
    }
}
//Switches summarery page from main to result page
function sumResult(){
    var resultBody = document.getElementById("sumBody");
    var mainPage = document.getElementById("mainCon");

    if (resultBody.style.display !== "none") {
        resultBody.style.display = "none";
        mainPage.style.display = "block"; 
    } else {
        mainPage.style.display = "none";
        resultBody.style.display = "block";
    }
}
//Switches url page from main to result page
function urlResult(){
    var resultBody = document.getElementById("urlBody");
    var mainPage = document.getElementById("mainURLCon");

    if (resultBody.style.display !== "none") {
        resultBody.style.display = "none";
        mainPage.style.display = "block"; 
    } else {
        mainPage.style.display = "none";
        resultBody.style.display = "block";
    }
}

    // Check if dark mode preference is stored
    var urlParams = new URLSearchParams(window.location.search);
    var theme = urlParams.get('theme');

    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
      document.getElementById('darkModeToggle').checked = true;
    } else {
      document.body.classList.remove('dark-theme');
      document.getElementById('darkModeToggle').checked = false;
    }

    function toggleDarkMode() {
      var darkModeToggle = document.getElementById('darkModeToggle');
      if (darkModeToggle.checked) {
        document.body.classList.add('dark-theme');
        localStorage.setItem('darkModeEnabled', 'true'); // Store dark mode preference
      } else {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('darkModeEnabled', 'false'); // Remove dark mode preference
      }
    }

