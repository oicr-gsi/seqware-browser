//arguments: sampleType, json/zipFile, IUSSWID, path to tmp dir for charts, xenomeFile,
// n/a for inexistant files

// Node Modules
var fs = require('fs');
var readMultipleFiles = require('read-multiple-files');
var functions = require("./transformFunctions.js")


functions.makeObject(process.argv[2], process.argv[3], process.argv[4], process.argv[5], process.argv[6], function (obj, path, IUSSWID) {
	var stream = fs.createWriteStream(path+"/qc-"+IUSSWID+".json");
	stream.once('open', function(fd) {
		stream.write(JSON.stringify(obj));
		stream.end();
	});
});