// Statics to fix
var zoomLevel = 13;
var mapCentreLat = 51.500152;
var mapCentreLng = -0.126236;

var googleMapsColours =
    ["red", "blue", "orange", "green", "purple", "yellow", "pink"];

var iconList =
    jQuery.map(googleMapsColours, function(x) {
        return "http://maps.google.com/mapfiles/ms/icons/" + x + "-dot.png";
    })


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

function makeLatLngRequest(geocoder, address, resultCallback, errorCallback, errorList, limitRetryTime) {
    limitRetryTime = typeof(limitRetryTime) === "undefined" ? 2000 : limitRetryTime;
    geocoder.geocode( { "address" : address }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            resultCallback(results);
        } else if(status === "OVER_QUERY_LIMIT") {
            console.log("Over query limit: " + address + ". Retrying in " + limitRetryTime);
            setTimeout(function() {
                makeLatLngRequest(geocoder, address, resultCallback, errorCallback, errorList, limitRetryTime*1.5)},
                limitRetryTime);
        } else {
            errorCallback(address, status);
            if(typeof(errorList) !== "undefined"){
                errorList.push({"address" : address, "status" : status})
            }
        }
    });
};

function basicErrorCallback(address, status) {
    console.log("Geocode unsuccessful for: " + address + ". Status: " + status);
}

function listErrorCallback(name, address, status) {
    var options = {
        dataName : "errorType",
        dataValue : status
    }
    var address = address === "" ? "<no address>" : address; 
    addItemToExistingList("#geocoding-errors", name + " - " + address + ": " + status, options);
}

function latLngCached(cache, geocoder, address, resultCallback, errorCallback, errorList) {
    var res = cache[address];
    if (typeof(res) === 'undefined') {
        console.log("Fetching from Google: " + address);
        makeLatLngRequest(geocoder, address, function(result) {
            cache[address] = result;
            stashCache();
            resultCallback(result);
        }, errorCallback, errorList);
    } else {
        console.log("Fetching from cache: " + address);
        resultCallback(res);
    }
}

// Utilities

function addItemToExistingList(listSelector, text, options) {
    var dataName = options["dataName"];
    var dataValue = options["dataValue"];
    var onClickFunc = options["onClick"];
    
    var liElement = $("<li>").text(text);
    
    if(typeof(dataName) !== "undefined") {
        var dataVal = typeof(dataValue) === "undefined" ? text : dataValue;
        liElement = liElement.data(dataName, dataVal);
    };

    if (typeof (onClickFunc) !== "undefined") {
        liElement.on("click", function (e) {
            onClickFunc(text, data);
        });
    };

    $(listSelector).append(liElement);
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

//function getDataFrom

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

function getUniqueCategories(markerList, categoryName) {
    categoryName = typeof(categoryName) === "undefined" ? "category" : "category";
    arr = [];
    jQuery.each(markerList, function(i, v) {
        var lowerCat = v[categoryName].toLowerCase();
        if(jQuery.inArray(lowerCat, arr)==-1) {
            arr.push(lowerCat);
        }
    });
    return arr;
}

function makeCategoryIconMap(uniqueCategories, iconList) {
    iconMap = {};
    jQuery.each(uniqueCategories, function(i, v) {
        iconMap[v.toLowerCase()] = iconList[i];
    });
    
    return iconMap;
}
    
    
google.maps.event.addDomListener(window, 'load', function() {
    
    document.getElementById("fileInput")
        .addEventListener("change", function(e) {
            handleFile(e, function(wb) {
                $("#sheetNames").show();
                handleExcelData(wb, function(name) {
                    $("#sheetNames").hide();
                    var data = readSheet(wb.Sheets[name]);
                    drawMap([], mapOptions, mapDiv);
                    
                    var iconMap = makeCategoryIconMap(getUniqueCategories(data), iconList);
                    
                    jQuery.each(data, function(i, v) {
                        latLngCached(latLngCache, geocoder, v.address, function(result) {
                            var marker = makeMarker(v.name, v.description,
                                result[0].geometry.location, iconMap[v.category.toLowerCase()]);
                            addMarkerToMap(map, marker);
                            }, function(a, s) { listErrorCallback(v.name, a, s)});
                    });
                });
            });
        }, false);
    
    mapOptions = {
        zoom: zoomLevel,
        center: new google.maps.LatLng(mapCentreLat, mapCentreLng),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    
    geocoder = new google.maps.Geocoder();    

    // drawMap(getData(), mapOptions, mapDiv);
    // 
    // latLngCached(latLngCache, geocoder, "E1 4GJ", function(result) {
    //     addMarkerToMap(map, makeMarker("home", "Home", result[0].geometry.location));
    // });
    
});