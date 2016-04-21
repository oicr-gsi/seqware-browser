// Script takes in fpr-Library.json output from perl fpr-json.pl
// Functions are based off of fpr-Library.json and update IUSSWIDRNAReportData to mongodb

var fs = require('fs');
var functions = require('./functions.js');
var JSON = require('JSON');

// Read from the fpr-Library.json file
fs.readFile(process.argv[2], 'utf8', function(err, data){
	if (err) return console.error(err);
	console.log("starting library");
	fprDataLibrary = JSON.parse(data);

	functions.updateIUSSWIDRNASeqQCData(fprDataLibrary);
});