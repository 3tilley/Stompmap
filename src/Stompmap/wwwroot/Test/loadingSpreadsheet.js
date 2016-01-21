
var workbookObj;

var sheetId = "sheet"

function handleFile(e, dataCallback) {
    console.log("Reading sheet");
    var files = e.target.files;
    var i, f;
    for (i = 0, f = files[i]; i != files.length; ++i) {
        var reader = new FileReader();
        var name = f.name;
        reader.onload = function (e) {
            console.log("Sheet loaded");
            var data = e.target.result;

            workbookObj = XLSX.read(data, { type: 'binary' });
            
            dataCallback(workbookObj);

        };
        reader.readAsBinaryString(f);
    }
}

function handleExcelData(workbook, onClickFunction) {
    jQuery.each(workbook.SheetNames, function (i, val) {
        makeSheetNameList("#sheetNames", val, onClickFunction);
    });
}

function pushDataToDiv(name) {
    var worksheet = workbookObj.Sheets[name];
    var outputText = JSON.stringify(readSheet(worksheet));
    $("#sheetContent").text(outputText);
}



function readSheet(worksheet) {
    var refRange = worksheet["!ref"].split(":");
    var startCell = refRange[0];
    var endCell = refRange[1];

    var startCol = startCell[0];
    var endCol = endCell[0];

    var startRow = startCell.slice(1, 500);
    var endRow = endCell.slice(1, 500);

    var headers = [];
    var outputArr = [];

    var numHeaders = endCol.charCodeAt() - startCol.charCodeAt();
    for (i = startCol.charCodeAt(); i <= endCol.charCodeAt(); i++) {
        headers.push(
            {   col : String.fromCharCode(i),
                name: worksheet[String.fromCharCode(i) + startRow].v.trim().toLowerCase() }
            );
    };

    for (j = startRow + 1; j <= endRow; j++) {
        var tempObj = {};
        jQuery.each(headers, function(i, val) {
            var cellVal = worksheet[val["col"] + j];
            tempObj[val["name"]] = cellVal == null ? "" : cellVal.v.trim();
        });
        outputArr.push(tempObj);
    }

    return outputArr;
}

function readSheetAndPush(workbook, sheetName, pushDiv) {
    var sheet = workbook.Sheets[sheetName];

    pushDiv.text("hello");
}

function makeSheetNameList(holdingList, name, onClickFunction) {

    var liElement = $("<li>").data("sheetName", name).text(name);

    if (typeof (onClickFunction) !== "undefined") {
        liElement.on("click", function (e) {
            onClickFunction(name)
        });
    };

    $(holdingList).append(liElement);
}

// $(window).load(function () {
//     document.getElementById("fileInput")
//         .addEventListener("change", function(e) { handleFile(e, handleExcelData); }, false);
// })
