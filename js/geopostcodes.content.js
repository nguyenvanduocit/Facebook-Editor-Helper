(function ($) {
    getRegion();
    getPlace();
    var clipboard = new Clipboard('#btn-copy', {
        text: function (trigger) {
            return $("#parsed_data").text();
        }
    });
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
                    console.log($tds);
                    var $name = $tds.eq(0);
                    var $suburb = $name.find('span');
                    if($suburb.length >0){
                        place.count = $suburb.text();
                    }
                    else{
                        place.count = '';
                    }
                    place.name = $name.text().replace(place.count,'');
                    place.zipCode = $tds.eq(2).text();

                    placeList.push(place);
                });
                $('#browse').prepend('<p id="parsed_data">'+JSON.stringify(placeList)+'</p>');
            });
            $('#browse').prepend(grabButton);
        }
    }
    function getRegion(){
        var $placeList = $('tr[itemtype="http://schema.org/AdministrativeArea"]');
        if($placeList.length > 0){
            var grabButton = $('<button id="btn-copy">Get Region</button>');
            grabButton.on('click', function(){
                $placeList = $('tr[itemtype="http://schema.org/AdministrativeArea"]');
                var placeList = [];
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

                    place.totalPlace = $tds.eq(2).text();
                    place.child = [];
                    placeList.push(place);
                });
                $('#browse').prepend('<p id="parsed_data">'+JSON.stringify(placeList)+'</p>');
            });
            $('#browse').prepend(grabButton);
        }
    }
})(jQuery);
