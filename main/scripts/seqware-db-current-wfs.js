// Script takes in analysisYAML file and updates Current Workflow Runs table in mongodb
var fs = require('fs');
var functions = require('./functions.js');
var YAML = require('yamljs');

fs.readFile(process.argv[2], 'utf8', function(err, data){	
	if (err) return console.error(err);
	analysisYAML = YAML.parse(data);

	functions.updateRunningWorkflowRuns(analysisYAML);
});
