var requested = false;
var reqeusted_url = "";

function handle_fetch_results(){
    console.log(this.status);
    console.log(this.responseText);
    if (this.status != 200)
        return;
    requested = false;
    const url = document.getElementById("url").value;
    document.getElementById("url").value = "";
    const element = document.getElementById("results");
    element.innerHTML = this.responseText;
    element.className = "";
}

function handle_update_estimate(){
    console.log(this.responseText);
    console.log(this.status);
    if (this.status != 200 && this.responseText == "" || this.responseText == null)
        return;
    const json = JSON.parse(this.responseText);
    const element = document.getElementById("results");
    element.className = "";
    element.innerHTML = "Estimated Time Remaining: " + json.days + " Days " + json.hours + " Hours " + json.minutes + " Minutes " + json.seconds + " Seconds";
}

function check_for_completion(){
    if (requested && !(reqeusted_url == null || reqeusted_url == ""))
    {
        const fetch_request = new XMLHttpRequest();
        fetch_request.onload = handle_fetch_results;
        fetch_request.open("POST", "https://cosc4p02.tpgc.me/s/request", true);
        fetch_request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        fetch_request.send(reqeusted_url);
    }
}

function summarize_url(){
    const url = document.getElementById("url").value;
    // server will filter out double requests but we should still avoid making multiple.
    if (reqeusted_url == url)
    {
        return;
    }

    if (url == null || url == "")
    {
        alert("Please provide a URL!");
        return;
    }

    requested = true;
    reqeusted_url = url;

    const fetch_request = new XMLHttpRequest();
    fetch_request.onload = handle_fetch_results;
    fetch_request.open("POST", "https://cosc4p02.tpgc.me/s/fetch", false);
    fetch_request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    fetch_request.send(url);

    if (!requested)
        return;

    const summarizer_request = new XMLHttpRequest();
    summarizer_request.open("POST", "https://cosc4p02.tpgc.me/s/request", true);
    summarizer_request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    summarizer_request.send(url);

    const estimate_request = new XMLHttpRequest();
    estimate_request.onload = handle_update_estimate;
    estimate_request.open("POST", "https://cosc4p02.tpgc.me/s/estimate", true);
    estimate_request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    estimate_request.send(url);
}

setInterval(check_for_completion, 5000);