// Script takes in pinery data output

var fs = require('fs');
var readMultipleFiles = require('read-multiple-files');
var functions = require('/u/mcheng/browsertest/fpr.js');
//var functions = require('/home/mcheng/Documents/workspace/seqware-browser/main/fpr.js');
var	mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://10.30.128.97:27017/seqwareBrowser';

var dateNow = new Date();

// read pinery output files
readMultipleFiles([process.argv[2], process.argv[3], process.argv[4], process.argv[5]], 'utf8', function(err, data){
	if (err) return console.error(err);
	console.log("starting pinery files");
	sequencerData = JSON.parse(data[0])
	sampleData = JSON.parse(data[1]);
	skipData = JSON.parse(data[2]);
	receiveData = JSON.parse(data[3]);

	functions.updateLibraryInfo(sequencerData, sampleData, skipData, receiveData);
});