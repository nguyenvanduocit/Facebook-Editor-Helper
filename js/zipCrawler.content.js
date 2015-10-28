(function ($) {
    getRegion();
    getPlace();
    function getPlace(){
        var $placeList = $('tr[itemtype="http://schema.org/City"]');
        if($placeList.length > 0){
            var grabButton = $('<button id="btn-copy">Get Place</button>');
            grabButton.on('click', function(){
                $placeList = $('tr[itemtype="http://schema.org/City"]');
                var placeList = [];
                $placeList.each(function () {
                    var place = {};

                    var $target = $(this);
                    var $tds = $target.find('td');
                    var $name = $tds.eq(0);
                    var $suburb = $name.find('span');
                    if($suburb.length >0){
                        place.suburb = $suburb.text();
                    }
                    else{
                        place.suburb = '';
                    }
                    place.name = $name.text().replace(place.suburb,'');
                    place.zipCode = $tds.eq(2).text();
                    place.id = $tds.eq(3).find('.rec').attr('id');
                    placeList.push(place);
                });

                chrome.runtime.sendMessage({event: "post_places", list:placeList, slug:window.location.pathname.replace('/','')}, function(response) {
                    $('#browse').append('<p id="parsed_data">'+JSON.stringify(response.data)+'</p>');
                });
            });
            $('#browse').append(grabButton);
        }
    }
    function getRegion(){
        var $placeList = $('tr[itemtype="http://schema.org/AdministrativeArea"]');
        if($placeList.length > 0){
            var grabButton = $('<button id="btn-copy">Get Region</button>');
            grabButton.on('click', function(){
                $placeList = $('tr[itemtype="http://schema.org/AdministrativeArea"]');
                var regionList = [];
                $placeList.each(function () {
                    var place = {};

                    var $target = $(this);
                    var $tds = $target.find('td');

                    var $name = $tds.eq(0).find('a');
                    place.name = $name.text();
                    place.slug = $name.attr('href');

                    var $code = $tds.eq(1).find('.code');
                    $code.each(function(){
                        var $target = $(this);
                        var codeType = $target.attr('class').replace('code', '').trim();
                        place[codeType] = $target.text();
                    });

                    place.totalPlace = parseInt($tds.eq(2).text().replace(' ', '').trim());
                    regionList.push(place);
                });
                chrome.runtime.sendMessage({event: "post_regions", list:regionList, slug:window.location.pathname.replace('/','')}, function(response) {
                    $('#browse').append('<p id="parsed_data">'+JSON.stringify(response.data)+'</p>');
                });
            });
            $('#browse').append(grabButton);
        }
    }
})(jQuery);