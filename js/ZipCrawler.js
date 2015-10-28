(function(){

    var ZipCrawler = function(){
        "use strict";
        this.zipCode = [];
    };
    ZipCrawler.prototype.loadData = function(){
        "use strict";
        var self = this;
        $.getJSON( "js/data.json", function( data ) {
            self.zipCode = data;
            console.log(self.zipCode);
        });
    };
    ZipCrawler.prototype.saveData = function(){
        "use strict";
        chrome.storage.sync.set({"zipCode":this.zipCode}, function(){
            console.log('Saved');
        });
    };
    ZipCrawler.prototype.onRecivePlace = function(data){
        "use strict";
        return this.addNode(this.zipCode, data);
    };
    ZipCrawler.prototype.onReciveRegion = function(data){
        "use strict";
        return this.addNode(this.zipCode, data);
    };
    ZipCrawler.prototype.addNode = function(collection, data){
        "use strict";
        //console.log('before add : ', collection, data);
        var self = this;
        if(Array.isArray(collection)){
            if(collection.length > 0) {
                for (var index = 0; index < collection.length; index++) {
                    let node = collection[index];
                    let result = self.addNode(node, data);
                    if (result) {
                        return true;
                    }
                }
                return false;
            }
            else{
                collection.push(data);
                return true;
            }
        }
        else{
            if((typeof collection.slug !='undefined') && (collection.slug == data.slug)){
                collection.list = data.list;
                return true;
            }else{
                if((typeof collection.list != "undefined") && Array.isArray(collection.list)){
                    return self.addNode(collection.list, data);
                }
                else{
                    return false
                }
            }
        }
    };
    ZipCrawler.prototype.initEventHandler = function(){
        "use strict";
        var self = this;
        chrome.runtime.onMessage.addListener(
            function(request, sender, sendResponse) {
                var result = null;
                switch (request.event){
                    case "post_places":
                        result = self.onRecivePlace(request);
                        break;
                    case "post_regions":
                        result = self.onReciveRegion(request);
                        break;
                    case "get_data":
                        /**
                         * Data is alway shiped with response
                         * @type {boolean}
                         */
                        result = true;
                        break;
                }
                if(result != null){
                    //self.saveData();
                    sendResponse({success:result, data:self.zipCode});
                }
            });
    };
    /**
     * Create new instance of application
     * @type {ZipCrawler}
     */
    var crawler = new ZipCrawler();
    crawler.loadData();
    crawler.initEventHandler();
})();