// Statics to fix
var zoomLevel = 13;
var mapCentreLat = 40.722283;
var mapCentreLng = -73.98747;

// Geocoding cache
Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
}

var latLngCache = localStorage.getObject("latLng");
latLngCache = (latLngCache === null) ? {} : latLngCache;

function stashCache() {
    localStorage.setObject("latLng", latLngCache);
}

function makeLatLngRequest(geocoder, address, resultCallback) {
    geocoder.geocode( { "address" : address }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            resultCallback(results);
        } else {
            alert("Geocode unsuccessful: " + status);
        }
    });
};

function latLngCached(cache, geocoder, address, resultCallback) {
    var res = cache[address];
    if (typeof(res) === 'undefined') {
        console.log("Fetching from Google: " + address);
        makeLatLngRequest(geocoder, address, function(result) {
            cache[address] = result;
            stashCache();
            resultCallback(result);
        });
    } else {
        console.log("Fetching from cache: " + address);
        resultCallback(res);
    }
}

// Basic map options

// Statics I don't care about
var map;
var geocoder;
var mapDiv = 'map-canvas';
var mapOptions;

function getData() {
    var data =
        [
            {
                name: "Apotheke",
                description: "Speakeasy. requires password from @apothekenyc Twitter on Wednesdays.",
                latLng: new google.maps.LatLng(40.7142426, -73.99815199999999),
                icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
            },
            {
                name: "Metlife Stadium",
                description: "Home of the NY Giants! Game against the Broncos.",
                latLng: new google.maps.LatLng(40.8142092, -74.0736902),
                icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
            }
        ];
        
    return data
};

function makeMarker(name, description, latLng, icon) {
    icon = (typeof icon === 'undefined') ? 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' : icon;
    var marker = {
        name: name,
        description: description,
        latLng: latLng,
        icon: icon
    };
    return marker;
}

function addMarkerToMap(mapObj, markerData) {
  
    var marker = new google.maps.Marker({
        position: markerData.latLng,
        map: mapObj,
        title: markerData.name,
        icon: markerData.icon
    });
  
    var displayString =
        "<h1>" + markerData.name + "</h1>"
        + "<p>" + markerData.description + "</p>"
         
    var window = new google.maps.InfoWindow({
        content: displayString
    });
    
    google.maps.event.addListener(marker, 'mouseover', function () {
        window.open(map, marker);
    });
    
    google.maps.event.addListener(marker, 'mouseout', function () {
        window.close();
    });
}

function drawMap(markers, mapOptions, holdingElementId) {

    map = new google.maps.Map(document.getElementById(holdingElementId),
        mapOptions);
        
    jQuery.each(markers, function(i, m) {
        addMarkerToMap(map, m);
    });
    
}

google.maps.event.addDomListener(window, 'load', function() {
    
    mapOptions = {
        zoom: zoomLevel,
        center: new google.maps.LatLng(mapCentreLat, mapCentreLng),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    
    geocoder = new google.maps.Geocoder();    

    drawMap(getData(), mapOptions, mapDiv);
    
    latLngCached(latLngCache, geocoder, "E1 4GJ", function(result) {
        addMarkerToMap(map, makeMarker("home", "Home", result[0].geometry.location));
    });
    
});
