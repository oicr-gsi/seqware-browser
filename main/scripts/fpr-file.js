// Script takes in fpr-File.json output from perl fpr-json.pl
// Functions are based off of fpr-File.json and update file data to mongodb

var fs = require('fs');
var functions = require('./functions.js');
var JSON = require('JSON');

fs.readFile(process.argv[2], 'utf8', function(err, data) {
	if (err) return console.error(err);
	console.log('reading files');
	fprDataFiles = JSON.parse(data);

	functions.updateFileInfo(fprDataFiles);
})
