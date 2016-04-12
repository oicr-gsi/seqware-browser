// Script takes in pinery data output - sequencer run

var fs = require('fs');
var functions = require('/u/mcheng/browsertest/fpr.js');
//var functions = require('/home/mcheng/Documents/workspace/seqware-browser/main/fpr.js');

// read pinery output files
fs.readFile(process.argv[2], 'utf8', function(err, data){
	if (err) return console.error(err);
	console.log("starting pinery files");
	sequencerData = JSON.parse(data)

	functions.updateRunInfo(sequencerData);
});