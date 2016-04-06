// Script takes in fpr-Project.json output from perl fpr-json.pl
// Functions are based off of fpr-Project.json and update project data to mongodb

var fs = require('fs');
var _ = require('underscore');
var http = require("http");
var	mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://10.30.128.97:27017/seqwareBrowser';
//var functions = require('/home/mcheng/Documents/workspace/seqware-browser/main/fpr.js');
var functions = require('/u/mcheng/browsertest/fpr.js');
var dateNow = new Date();

fs.readFile(process.argv[2], 'utf8', function(err, data) {
	if (err) return console.error(err);
	console.log('reading files');
	fprDataFiles = JSON.parse(data);

	functions.updateFilesInfo(fprDataFiles);
})