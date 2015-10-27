(function($){
    var Controler = function(options){
        "use strict";
        this.$module_editor = $('#module_editor');
        this.categoryNameMap = {
            "nhiếp ảnh":["Nhiếp ảnh gia", "chụp ảnh"],
            "cà phê": ["Quán cà phê","Cửa hàng cà phê"],
            "Trường học": ["Cao đẳng Đại học"]

        };
        this.detectedCategories = null;
        var key =this.assimilationCateogryName("Nhiếp ảnh gia");
        console.log(key);
    };
    Controler.prototype.getDetectedCategories = function(){
        "use strict";
        if(this.detectedCategories == null){
            this.detectedCategories = [];
            var self =this;
            var $categories = this.$module_editor.find('.pageSuggestTitle .fsm.fwb.fcw');
            var rawText =$categories.text();
            var rawArray = rawText.split(" · ");
            _.each(rawArray, function(name){
                name = name.trim();
                name = self.assimilationCateogryName(name);
                self.detectedCategories.push(name);
            });
        }
        return this.detectedCategories;
    };
    Controler.prototype.autoCheckCategories = function(){
        "use strict";
        var $cateogoriesContainer = this.$module_editor.find('._3jvu._4c10');
        var $categoryRows = $cateogoriesContainer.find('._226w');
        var self = this;
        if($categoryRows.length > 0) {
            $categoryRows.each(function () {
                var row = $(this);
                var $name = row.find('._6a');
                var name = $name.text().trim();

                if(self.mayMatch(name) >= 0){
                    var $button = row.find('button[value="agree"]');
                    $button.click();
                }
            });
        }
    };
    Controler.prototype.assimilationCateogryName = function(name){
        "use strict";
        var found = null;
        _.each(this.categoryNameMap, function(names, key){
            console.log(names, key);
            _.each(names, function(longName){
                if(longName == name){
                    found = key;
                    return true;
                }
            });
            if(found != null){
                return true;
            }
            console.log(key);
        });
        return found;
    };
    Controler.prototype.mayMatch = function(name){
        "use strict";
        var self = this;
        var definedCategories = this.getDetectedCategories();
        _.each(definedCategories, function(categoryName){
            return categoryName == self.assimilationCateogryName(name);
        });
    };
    /**
     *
     * @type {Controler}
     */
    var controller = new Controler();
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            //console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
            if (request.event == "fetch_more_success")
            {
                //var $places_editor_save = $module_editor.find('#place_editor_next_area #places_editor_save');
                //$places_editor_save.text('hihi');
                //controller.autoCheckCategories();
                sendResponse({success: true});
            }
            else{
                sendResponse({success: false, request:request});
            }
        });
})(jQuery);
