// arguments: transformedJsonFile
var fs = require('fs');
var config = require('config.js');
var JSON = require('JSON');

// Initialize mongo config
var	mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://' + config.mongo.host + '/' + config.mongo.database;

fs.readFile(process.argv[2], 'utf8', function (err, data) {
	if (err) console.error(err);
	runData = JSON.parse(data);

	MongoClient.connect(url, function(err, db) {
		if (err) return console.error(err);
		//console.log('connected');

		// Return updated info to mongodb, insert if not already in db
		//batch.find({iusswid: newIUSSWID[i]}).upsert().updateOne(obj);
		db.collection('QC').updateOne({iusswid: runData['iusswid']}, runData, {upsert: true}, function (err) {
			if (err) return console.error(err);
			db.close();
		});
	});
});