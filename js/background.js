(function(){

    var Application = function(){
        "use strict";
        this.filter = {
            urls: ["https://www.facebook.com/editor/fetch_more*"]
        };
        this.opt_extraInfoSpec = ["responseHeaders"];
    };
    Application.prototype.onCompleted = function(details){
        "use strict";
        console.log(details);
        if(details.statusCode == 200) {
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {event: "fetch_more_success"}, function (response) {
                    console.log(response);
                });
            });
        }
        else{
            console.log('Error', details);
        }
    };
    /**
     * Create new instance of application
     * @type {Application}
     */
    var app = new Application();
    /**
     * https://developer.chrome.com/extensions/webRequest#event-onBeforeRequest
     */
    chrome.webRequest.onCompleted.addListener(
        app.onCompleted, app.filter, app.opt_extraInfoSpec);
})();