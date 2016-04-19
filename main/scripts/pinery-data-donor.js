// Script takes in pinery data output - sequencer runs and samples

var readMultipleFiles = require('read-multiple-files');
var functions = require('functions.js');
var JSON = require('JSON');

// read pinery output files
readMultipleFiles([process.argv[2], process.argv[3]], 'utf8', function(err, data){
	if (err) return console.error(err);
	console.log("starting pinery files");
	sequencerData = JSON.parse(data[0])
	sampleData = JSON.parse(data[1]);

	functions.updateDonorInfo(sequencerData, sampleData);
});