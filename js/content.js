(function ($) {

    jQuery.expr[':'].regex = function(elem, index, match) {
        var matchParams = match[3].split(','),
            validLabels = /^(data|css):/,
            attr = {
                method: matchParams[0].match(validLabels) ?
                    matchParams[0].split(':')[0] : 'attr',
                property: matchParams.shift().replace(validLabels,'')
            },
            regexFlags = 'ig',
            regex = new RegExp(matchParams.join('').replace(/^s+|s+$/g,''), regexFlags);
        return regex.test(jQuery(elem)[attr.method](attr.property));
    };

    var Controler = function (options) {
        "use strict";
        this.$module_editor = $('#module_editor');
        this.categoryNameMap = {
            "nhiếp ảnh": ["Nhiếp ảnh gia", "chụp ảnh"],
            "cà phê": ["Cà phê", "Quán cà phê", "Cửa hàng cà phê"],
            "Trường học": ["Cao đẳng Đại học"],
            "Học vấn": ["Giáo dục", "Trường học"],
            "Dịch vụ sửa chữa": ["Dịch vụ sửa chữa"],
            "Nhà Hàng": ["Tiệc nướng"]

        };
        this.detectedCategories = null;
        this.isBusy = false;
    };
    Controler.prototype.getDetectedCategories = function () {
        "use strict";
        if (this.detectedCategories == null) {
            this.detectedCategories = [];
            var self = this;
            var $categories = this.$module_editor.find('.pageSuggestTitle .fsm.fwb.fcw');
            var rawText = $categories.text();
            var rawArray = rawText.split(" · ");
            _.each(rawArray, function (name) {
                name = name.trim();
                name = self.assimilationCateogryName(name);
                self.detectedCategories.push(name);
            });
        }
        return this.detectedCategories;
    };
    Controler.prototype.autoCheckCity = function () {
        var $cityContainer = this.$module_editor.find('._51mx');
    };
    Controler.prototype.autoCheckCategories = function () {
        "use strict";
        var $cateogoriesContainer = this.$module_editor.find('._3jvu._4c10');
        var $categoryRows = $cateogoriesContainer.find('._226w');
        var self = this;
        if ($categoryRows.length > 0) {
            $categoryRows.each(function () {
                var row = $(this);
                var $name = row.find('._6a');
                var name = $name.text().trim();

                if (self.mayCheck(name) >= 0) {
                    var $button = row.find('button[value="agree"]');
                    $button.click();
                }
            });
        }
    };
    Controler.prototype.assimilationCateogryName = function (name) {
        "use strict";
        var found = null;
        _.each(this.categoryNameMap, function (names, key) {
            console.log(names, key);
            _.each(names, function (longName) {
                if (longName == name) {
                    found = key;
                    return true;
                }
            });
            if (found != null) {
                return true;
            }
        });
        console.log(found);
        return found;
    };
    Controler.prototype.mayCheck = function (name) {
        "use strict";
        var self = this;
        var definedCategories = this.getDetectedCategories();
        _.each(definedCategories, function (categoryName) {
            return categoryName == self.assimilationCateogryName(name);
        });
    };
    Controler.prototype.fillCity = function () {
        var $cityInput = this.$module_editor.find('input[name="place_city_id"]');
        $cityInput.val("108458769184495");
    };
    Controler.prototype.vote = function () {
        var $cityVote = this.$module_editor.find("input:regex(name,place_address_vote\\[.*\"city_id\":108458769184495.*)");
        if ($cityVote.length > 0) {
            $cityVote.siblings().find('button[value="agree"]').click();
        }
    };
    Controler.prototype.submit = function () {
        var $places_editor_save = this.$module_editor.find('#place_editor_next_area #places_editor_save');
        $places_editor_save.click();
    };
    /**
     *
     * @type {Controler}
     */
    var controller = new Controler();
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            if(!controller.isBusy){
                //console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
                if (request.event == "fetch_more_success") {
                    controller.isBusy = true;
                    setTimeout(function(){
                        //controller.autoCheckCategories();
                        controller.fillCity();
                        controller.vote();
                        controller.submit();
                        controller.isBusy = false;
                    }, 7000);
                    sendResponse({success: true});
                }
                else {
                    sendResponse({success: false, request: request});
                }
            }else{
                sendResponse({success: false, request: request, reason:'busy'});
            }
        });
    $(document).bind('keydown', 'shift+z', function () {
        controller.submit();
    });
})(jQuery);
