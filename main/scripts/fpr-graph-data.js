// Script takes in fpr-Library.json output from perl fpr-json.pl
// Functions are based off of fpr-Library.json and update graph data to mongodb

var fs = require('fs');
var functions = require('functions.js');

// Read from the fpr-Library.json file
fs.readFile(process.argv[2], 'utf8', function(err, data){
	if (err) return console.error(err);
	console.log("starting library");
	fprDataLibrary = JSON.parse(data);

	functions.updateGraphData(fprDataLibrary);
});
