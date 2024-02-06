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