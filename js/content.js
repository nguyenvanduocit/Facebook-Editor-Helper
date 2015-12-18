(function ($) {

    jQuery.expr[':'].regex = function (elem, index, match) {
        var matchParams = match[3].split(','),
            validLabels = /^(data|css):/,
            attr = {
                method: matchParams[0].match(validLabels) ?
                    matchParams[0].split(':')[0] : 'attr',
                property: matchParams.shift().replace(validLabels, '')
            },
            regexFlags = 'ig',
            regex = new RegExp(matchParams.join('').replace(/^s+|s+$/g, ''), regexFlags);
        return regex.test(jQuery(elem)[attr.method](attr.property));
    };

    var Controler = function (options) {
        "use strict";
        var self = this;
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
        this.waitTime = Date.now();
        this.delayTime = 7000;
        this.isWaitToSubmit = false;
        setInterval(function () {
                self.updateTimer();
            }, 1000
        );
    };
    Controler.prototype.updateTimer = function () {
        if (this.isWaitToSubmit) {
            this.$module_editor.find('button[name="submit_form"]').text("Next in " + (((this.delayTime+5000) / 1000 - 1) - Math.floor((Date.now() - this.waitTime) / 1000)) + "s");
        }
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
            //console.log(names, key);
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
        //console.log(found);
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
        //Vote city
        var $cityVote = this.$module_editor.find("input:regex(name,place_address_vote\\[.*\"city_id\":108458769184495.*)");
        if ($cityVote.length > 0) {
            $cityVote.siblings().find('button[value="agree"]').click();
        }
        //Vote website
        var $currentWebsite = this.$module_editor.find('.pageSuggestTitle .fsm.fwn.fcw a');
        if ($currentWebsite.length > 0) {
            var href = $currentWebsite.text();
            var domain = this.getDomainFromURL(href);
            var $suggestWebsite = this.$module_editor.find("input:regex(name,page_website_vote\\[.*\"website\":.*"+domain+".*)");
            if($suggestWebsite.length>0){
                if(domain.indexOf("clj.vn") >= 0 || domain.indexOf("facebook.com") >= 0 || domain.indexOf("5giay.vn") >= 0 || domain.indexOf("webmienphi.in") >= 0){
                    $suggestWebsite.siblings().find('button[value="disagree"]').click();
                }else{
                    $suggestWebsite.siblings().find('button[value="agree"]').click();
                }
            }

        }

    };
    Controler.prototype.getDomainFromURL = function (url) {
        var a = document.createElement('a');
        a.href = url;
        return a.hostname;
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
            if (!controller.isWaitToSubmit) {
                //console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
                if (request.event == "fetch_more_success") {
                    controller.isWaitToSubmit = true;
                    controller.waitTime = Date.now();
                    setTimeout(function () {
                        controller.autoCheckCategories();
                        controller.fillCity();
                        controller.vote();
                        setTimeout(function(){
                            controller.isWaitToSubmit = false;
                            controller.submit();
                            sendResponse({success: true});
                        },5000);
                    }, controller.delayTime);
                }
                else {
                    sendResponse({success: false, request: request});
                }
            } else {
                sendResponse({success: false, request: request, reason: 'busy'});
            }
        });
    $(document).bind('keydown', 'shift+z', function () {
        controller.submit();
    });
})(jQuery);
