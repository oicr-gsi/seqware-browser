// Script takes in pinery data output
var fs = require('fs');
var functions = require('functions.js');
var YAML = require('yamljs');

fs.readFile(process.argv[2], 'utf8', function(err, data){
	if (err) return console.error(err);
	console.log("reading yaml");
	analysisYAML = YAML.parse(data);

	functions.updateWorkflowInfo(analysisYAML);
});