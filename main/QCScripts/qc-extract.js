// determine what ius swids need to be added to the QC collection
//arguments: file prominance report, path to tmp dir
// Node Modules
var fs = require('fs');
var config = require(process.env.config);
// Initialize mongo config
var	mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://' + config.mongo.host + '/' + config.mongo.database;
var functions = require("./extractFunctions.js")

var analysisYAML;
var fileRead=process.argv[2];
fs.readFile(fileRead, 'utf8', function(err, data){
	if (err) return console.error(err);
	
	MongoClient.connect(url, function(err, db) {
		if (err) console.error(err);
		functions.makeFile(data,db, function(obj) {
			console.log(obj);
			db.close();
		});
	});
});