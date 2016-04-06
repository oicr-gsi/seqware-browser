// Script takes in fpr-Library.json output from perl fpr-json.pl
// Functions are based off of fpr-Library.json and update library data to mongodb

var fs = require('fs');
var _ = require('underscore');
var YAML = require('yamljs');
var http = require("http");
var AdmZip = require('adm-zip');
var	mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://10.30.128.97:27017/seqwareBrowser';
var functions = require('/u/mcheng/browsertest/fpr.js');
var dateNow = new Date();
var analysisYAML;

// Read from the fpr-Library.json file
fs.readFile(process.argv[3], 'utf8', function(err, data){
	if (err) return console.error(err);
	console.log("starting library");
	fprDataLibrary = JSON.parse(data);

	functions.updateIUSSWIDReportData(fprDataLibrary);
});

// read YAML containing info on workflows and their analysis type
fs.readFile(process.argv[2], 'utf8', function(err, data){
	if (err) return console.error(err);
	console.log("reading yaml");
	analysisYAML = YAML.parse(data);
});