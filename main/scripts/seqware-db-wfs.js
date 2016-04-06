// Script takes in pinery data output

var fs = require('fs');
var _ = require('underscore');
var YAML = require('yamljs');
var functions = require('/u/mcheng/browsertest/fpr.js');
//var functions = require('/home/mcheng/Documents/workspace/seqware-browser/main/fpr.js');
var	mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://10.30.128.97:27017/seqwareBrowser';

var analysisYAML;

// read YAML containing info on workflows and their analysis type
fs.readFile(process.argv[2], 'utf8', function(err, data){
	if (err) return console.error(err);
	console.log("reading yaml");
	analysisYAML = YAML.parse(data);

	functions.updateWorkflowInfo(analysisYAML);
});