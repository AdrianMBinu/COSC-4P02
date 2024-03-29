function handle_fetch_results(){
    if (this.status != 200)
        return;
    const url = document.getElementById("url").value;
    document.getElementById("url").value = "";
    document.getElementById("results").innerHTML = this.responseText;
}

function handle_update_estimate(){
    console.log(this.responseText);
    if (this.status != 200)
        return;
    const json = JSON.parse(this.responseText);
    document.getElementById("results").innerHTML = "Estimated Time Remaining: " + json.days + " Days " + json.hours + " Hours " + json.minutes + " Minutes " + json.seconds + " Seconds";
}

function check_for_completion(){
    const url = document.getElementById("url").value;

    if (url == null || url == "")
        return;

    const fetch_request = new XMLHttpRequest();
    fetch_request.onload = handle_fetch_results;
    fetch_request.open("POST", "../s/fetch", true);
    fetch_request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    fetch_request.send(url);
}

function summarize_url(){
    const url = document.getElementById("url").value;
    console.log(url);

    if (url == null || url == "")
    {
        alert("Please provide a URL!");
        return;
    }

    const summarizer_request = new XMLHttpRequest();
    summarizer_request.open("POST", "../s/request", true);
    summarizer_request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    summarizer_request.send(url);

    const estimate_request = new XMLHttpRequest();
    estimate_request.onload = handle_update_estimate;
    estimate_request.open("POST", "../s/estimate", true);
    estimate_request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    estimate_request.send(url);
}

setInterval(check_for_completion, 5000);