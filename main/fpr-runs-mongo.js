var fs = require('fs');
var config = require('config.js');
// Initialize mongo config
var	mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
//var url = 'mongodb://' + config.mongo.host + '/' + config.mongo.database;
var url = 'mongodb://10.30.128.97/dev_db';

var analysisYAML;

	MongoClient.connect(url, function(err, db) {
		if (err) console.error(err);
		var ids = [];
		findReportDocumentsIUSSWID(ids, 'RunReportData', db, function (err) {
			if (ids.length>0) {
				console.log(ids[0]);
				for (i=1;i<ids.length;i++) {
					console.log("\|"+ids[i]);
				}
			}
			db.close();
		});
	});	


function findReportDocumentsIUSSWID(docs, collection, db, callback) {
	var cursor = db.collection(collection).find();
	cursor.each(function(err, doc) {
		if (err) return console.error(err);
		if (doc != null) {
			docs.push(doc.run_name.toString());
		} else {
			callback();
			return docs;
		}
	});
}