
var workbookObj;

var sheetId = "sheet"

function handleFile(e) {
  console.log("Reading sheet");
  var files = e.target.files;
  var i,f;
  for (i = 0, f = files[i]; i != files.length; ++i) {
    var reader = new FileReader();
    var name = f.name;
    reader.onload = function(e) {
      console.log("Sheet loaded");
      var data = e.target.result;

      workbookObj = XLSX.read(data, {type: 'binary'});

      jQuery.each(workbookObj.SheetNames, function(i, val) {
        makeSheetNameList("#sheetNames", val, function(name) {
          var worksheet = workbookObj.Sheets[name];
          var outputText = JSON.stringify(readSheet(worksheet));
          $("#sheetContent").text(outputText);
        });
      });
    };
    reader.readAsBinaryString(f);
  }
}

function readSheet(worksheet) {
  var refRange = worksheet["!ref"].split(":");
  var startCell = refRange[0];
  var endCell = refRange[1];
  
  var startCol = startCell[0];
  var endCol = endCell[0];
  
  var startRow = startCell.slice(1,500);
  var endRow = endCell.slice(1,500);
  
  var headers = [];
  var arr = [];
  
  var numHeaders = endCol.charCodeAt() - startCol.charCodeAt(); 
  for(i = startCol.charCodeAt(); i <= endCol.charCodeAt(); i++) {
    headers.push(worksheet[String.fromCharCode(i) + startRow].v);
  }
  return headers;
}

function readSheetAndPush(workbook, sheetName, pushDiv) {
  var sheet = workbook.Sheets[sheetName];
  
  pushDiv.text("hello");
}

function makeSheetNameList(holdingList, name, onClickFunction) {
  
  var liElement = $("<li>").data("sheetName", name).text(name);
  
  if (typeof(onClickFunction) !== "undefined") {
    liElement.on("click",  function(e) {
      onClickFunction(name)
    });
  };
  
  $(holdingList).append(liElement);
}

$(window).load(function () {
  document.getElementById("fileInput").addEventListener("change", handleFile, false);
})
