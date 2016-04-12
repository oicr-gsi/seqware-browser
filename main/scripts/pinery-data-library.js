// Script takes in pinery data output - sequencer runs and samples
// Script takes in data from seqware postgresql database - skip and receive data data

var fs = require('fs');
var readMultipleFiles = require('read-multiple-files');
var functions = require('/u/mcheng/browsertest/fpr.js');
//var functions = require('/home/mcheng/Documents/workspace/seqware-browser/main/fpr.js');

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