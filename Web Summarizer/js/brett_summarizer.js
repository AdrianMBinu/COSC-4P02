var requested = false;
var requested_url = "";

// handler for fetch request
// updates innerhtml of the results tag to whatever the summary is. Does nothing if summary is not complete.
// will reset requested to false.
function handle_fetch_results()
{
    if (this.status != 200)
        return;

    const json = JSON.parse(this.responseText);

    // bad response, somehow we got here?
    if (!json.has_summary){
        console.log("hey we got here somehow");
        return;
    }

    requested = false;
    requested_url = "";

    // clear url and update the summary text, and enable displaying of the <p>
    const element = document.getElementById("results");
    document.getElementById("url").value = "";
    element.innerHTML = json.summary;
    element.className = "";
}

// handler for time estimate request
// shows the rough time estimate this request is going to take (based on the last 10 requests)
function handle_update_estimate()
{
    if (this.status != 200 && this.responseText == "" || this.responseText == null)
        return;
    const json = JSON.parse(this.responseText);
    const element = document.getElementById("results");
    element.className = "";
    element.innerHTML = "Estimated Time Remaining: " + json.days + " Days " + json.hours + " Hours " + json.minutes + " Minutes " + json.seconds + " Seconds";
}

// helper function for sending a fetch request (checks if the summary is complete)
function send_fetch_request(url)
{
    const fetch_request = new XMLHttpRequest();
    fetch_request.onload = handle_fetch_results;
    fetch_request.open("POST", "https://cosc4p02.tpgc.me/s/fetch", false);
    fetch_request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    fetch_request.send(url);
}

// periodic function for checking if the request has been completed.
function check_for_completion()
{
    if (requested && !(requested_url == null || requested_url == ""))
        send_fetch_request(requested_url);
}

// function for sending the initial request
function summarize_url()
{
    const url = document.getElementById("url").value;
    // server will filter out double requests but we should still avoid making multiple.
    if (requested_url == url)
        return;

    // make sure a url was actually provided
    if (url == null || url == "")
    {
        alert("Please provide a URL!");
        return;
    }

    requested = true;
    requested_url = url;

    // do a sync request to check if the url already exists, if it does we really don't need to wait the 5 seconds for the update, we can just do it now.
    send_fetch_request(url);

    if (!requested)
        return;

    // send the actual summary request
    const summarizer_request = new XMLHttpRequest();
    summarizer_request.open("POST", "https://cosc4p02.tpgc.me/s/request", true);
    summarizer_request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    summarizer_request.send(url);

    // send a request for a time estimate. server side MIGHT use the url to determine a more accurate estimate
    // for now it currently use returns the average time of the last 10, no accounting for character count.
    const estimate_request = new XMLHttpRequest();
    estimate_request.onload = handle_update_estimate;
    estimate_request.open("POST", "https://cosc4p02.tpgc.me/s/estimate", true);
    estimate_request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    estimate_request.send(url);
}

setInterval(check_for_completion, 5000);