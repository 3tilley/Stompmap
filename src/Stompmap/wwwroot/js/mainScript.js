// Statics to fix
var zoomLevel = 13;
var mapCentreLat = 51.500152;
var mapCentreLng = -0.126236;

var googleMapsColours =
    ["red", "blue", "orange", "green", "purple", "yellow", "pink"];

var vistedColour = 'grey';

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

function makeLatLngRequest(geocoder, address, resultCallback, errorCallback, errorList, limitRetryTime, inProgressCallback) {
    limitRetryTime = typeof(limitRetryTime) === "undefined" ? 2000 : limitRetryTime;
    if (typeof(inProgressCallback) !== "undefined") {
        inProgressCallback(address);
    }
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
        dataValue : status,
        headerUpdateFunc : function () { headerUpdateFunc("#errorHeader", "errorcount", "Errors - ", 1) }
        //itemId : name.replace(" ", "")
    };
    var address = address === "" ? "<no address>" : address; 
    addItemToExistingList("#geocoding-errors", name + " - " + address + ": " + status, options);
}

function headerUpdateFunc(headerId, countDataId, headerText, incrementBy) {
        var h = $(headerId);
        var newNum = h.data(countDataId) + incrementBy;
        h.data(countDataId, newNum);
        h.text(headerText + newNum);
        if(h.data("titlehidden")) {
            h.show();
            h.data("titlehidden", false);
        }  
}

function latLngCached(cache, geocoder, address, resultCallback, errorCallback, errorList, inProgressCallback) {
    var res = cache[address];
    if (typeof(inProgressCallback !== "undefined")) {
        inProgressCallback(address);
    }
    if (typeof(res) === 'undefined') {
        console.log("Fetching from Google: " + address);
        makeLatLngRequest(geocoder, address, function(result) {
            cache[address] = result;
            stashCache();
            resultCallback(result);
        }, errorCallback, errorList, 2000);
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
    var headerFunc = options["headerUpdateFunc"];
    var itemId = options["itemId"];
    
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
    
    if (typeof(headerFunc) !== "undefined") {
        headerFunc();
    }
    
    if (typeof(itemId) !== "undefined") {
        liElement = liElement.attr("id", itemId);
    }

    $(listSelector).append(liElement);
}

function removeItemFromList(listSelector, itemId) {
    var itemId = itemId.toString()[0] == "#" ? itemId : "#" + itemId; 
    $(listSelector + " " + itemId).remove();
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

function makeMarker(name, description, latLng, category, address, geocoderResult, icon) {
    icon = (typeof icon === 'undefined') ? 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' : icon;
    var marker = {
        name: name,
        description: description,
        latLng: latLng,
        category : category,
        address : address,
        geocoderResult : geocoderResult,
        icon: icon
    };
    return marker;
}

function addMarkerToMap(mapObj, markerData) {
  
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(markerData.latitude, markerData.longtitude),
        map: mapObj,
        title: markerData.name,
        icon: markerData.icon || iconList[0]
    });
    
    marker.isForceOpen = false;
  
    var displayString =
        '<h1>' + markerData.name + '</h1>'
        + '<p>' + markerData.description + '</p>'
        + '<div class="markerAddress">' + markerData.address + '</div>'
        + '<div class="markerCategory">' + markerData.category + '</div>'
        + '<div class="markerResultJson">' + JSON.stringify(markerData.geocoderResult, null, "\t") + '</div>'
         
    var window = new google.maps.InfoWindow({
        content: displayString
    });
    
    google.maps.event.addListener(marker, 'mouseover', function () {
        window.open(map, marker);
    });
    
    google.maps.event.addListener(marker, 'mouseout', function () {
        if (marker.isForceOpen === false) {
            window.close();
        }
    });
    
    // If the marker is clicked we want to hold it open
    google.maps.event.addListener(marker, 'click', function () {
        if (marker.isForceOpen) {
            marker.isForceOpen = false;
            window.close();
        } else {
            marker.isForceOpen = true;
            window.open(map, marker);
        }
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
    

function drawMapFromRest(markersUrl, embeddedMapData) {

    if (typeof (embeddedMapData) === "undefined") {
        mapOptions = {
            zoom: zoomLevel,
            center: new google.maps.LatLng(mapCentreLat, mapCentreLng),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
    } else {
        mapOptions = {
            zoom: embeddedMapData.zoomLevel,
            center: new google.maps.LatLng(embeddedMapData.mapCentreLat, embeddedMapData.mapCentreLng),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
    }

    geocoder = new google.maps.Geocoder();


    $.ajax({
        dataType: "json",
        accepts: {
            text: "application/json"
        },
        url: markersUrl,
        success: function (data) {
            drawMap(data, mapOptions, mapDiv);
        }
    });
}
    
//google.maps.event.addDomListener(window, 'load', function() {
    
//    //$("#geocoding-errors").on("click", function(e) {
//    //    $("#geocoding-errors li").toggle();
//    //});
    
//    //$("#geocoding-requests").on("click", function(e) {
//    //    $("#geocoding-requests li").toggle();
//    //});
    
//    //document.getElementById("fileInput")
//    //    .addEventListener("change", function(e) {
//    //        handleFile(e, function(wb) {
//    //            $("#sheetNames").show();
//    //            handleExcelData(wb, function(name) {
//    //                $("#sheetNames").hide();
//    //                var data = readSheet(wb.Sheets[name]);
//    //                drawMap([], mapOptions, mapDiv);
                    
//    //                var iconMap = makeCategoryIconMap(getUniqueCategories(data), iconList);
                    
//    //                jQuery.each(data, function(i, v) {
//    //                    var itemId = "request-" + i;
//    //                    latLngCached(latLngCache, geocoder, v.address, function(result) {
//    //                        removeItemFromList("#geocoding-requests", itemId);
//    //                        headerUpdateFunc("#requestsHeader", "requestcount", "Requests - ", -1);
//    //                        var marker = makeMarker(v.name, v.description,
//    //                            result[0].geometry.location, v.category,
//    //                            v.address, result,
//    //                            iconMap[v.category.toLowerCase()]);
//    //                        addMarkerToMap(map, marker);
//    //                        }, function(a, s) {
//    //                                removeItemFromList("#geocoding-requests", itemId);
//    //                                headerUpdateFunc("#requestsHeader", "requestcount", "Requests - ", -1);
//    //                                listErrorCallback(v.name, a, s)}, [],
//    //                        function(address) {
//    //                            var options = { itemId : itemId }
//    //                            var address = address === "" ? "<no address>" : address; 
//    //                            var text = v.name + " - " + address; 
//    //                            addItemToExistingList("#geocoding-requests", text, options);
//    //                            headerUpdateFunc("#requestsHeader", "requestcount", "Requests - ", 1);
//    //                        }) ;
//    //                });
//    //            });
//    //        });
//    //    }, false);
    
//    if (typeof(embeddedMapData) === "undefined") {
//        mapOptions = {
//            zoom: zoomLevel,
//            center: new google.maps.LatLng(mapCentreLat, mapCentreLng),
//            mapTypeId: google.maps.MapTypeId.ROADMAP
//        };
//    } else {
//        mapOptions = {
//            zoom: embeddedMapData.zoomLevel,
//            center: new google.maps.LatLng(embeddedMapData.mapCentreLat, embeddedMapData.mapCentreLng),
//            mapTypeId: google.maps.MapTypeId.ROADMAP
//        };
//    } 
    
    
//    geocoder = new google.maps.Geocoder();    

//    //var jsonFile = jQuery.get(stompsUrl, function (data) {
//    //    drawMap(data, mapOptions, mapDiv);
//    //}, "json");

//    $.ajax({
//        dataType: "json",
//        accepts: {
//            text: "application/json"
//        },
//        url: stompsUrl,
//        success: function (data) {
//            drawMap(data, mapOptions, mapDiv);
//            }
//    });
     
//     //latLngCached(latLngCache, geocoder, "E1 4GJ", function(result) {
//     //    addMarkerToMap(map, makeMarker("home", "Home", result[0].geometry.location));
//     //});
    
//});