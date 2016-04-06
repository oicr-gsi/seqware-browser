// Script takes in pinery data output

var fs = require('fs');
var readMultipleFiles = require('read-multiple-files');
//var functions = require('/u/mcheng/browsertest/fpr.js');
var functions = require('/home/mcheng/Documents/workspace/seqware-browser/main/fpr.js');
var	mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://127.0.0.1:27017/seqwareBrowser';

var dateNow = new Date();

// read pinery output files
readMultipleFiles([process.argv[2], process.argv[3], process.argv[4]], 'utf8', function(err, data){
	if (err) return console.error(err);
	console.log("starting pinery files");
	sequencerData = JSON.parse(data[0])
	sampleData = JSON.parse(data[1]);
	projectData = JSON.parse(data[2]);

	functions.updateProjectInfo(sequencerData, sampleData, projectData);
});