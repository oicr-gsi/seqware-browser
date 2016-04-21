// Script takes in pinery data output - project

var fs = require('fs');
var functions = require('./functions.js');
var JSON = require('JSON');

// read pinery output files
fs.readFile(process.argv[2], 'utf8', function(err, data){
	if (err) return console.error(err);
	console.log("starting pinery files");
	projectData = JSON.parse(data);

	functions.updateProjectInfo(projectData);
});