// Script takes in pinery data output

var readMultipleFiles = require('read-multiple-files');
var _ = require('underscore');
var functions = require('/u/mcheng/browsertest/fpr.js');
//var functions = require('/home/mcheng/Documents/workspace/seqware-browser/main/fpr.js');
var	mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://10.30.128.97:27017/seqwareBrowser';

readMultipleFiles([process.argv[2], process.argv[3]], 'utf8', function (err, data) {
	if (err) console.error(err);
	console.log('reading run stuff');
	var seqwareRuns = JSON.parse(data[0]);
	var pineryRuns = JSON.parse(data[1]);

	functions.updateRunningSequencerRuns(pineryRuns, seqwareRuns);
});