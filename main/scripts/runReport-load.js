// arguments: transformedJsonFile
var config = require(process.env.config);
var JSON = require('JSON');

// Initialize mongo config
var	mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://' + config.mongo.host + '/' + config.mongo.database;

runData = JSON.parse(process.argv[2]);

MongoClient.connect(url, function(err, db) {
	if (err) return console.error(err);

	// Return updated info to mongodb, insert if not already in db
	db.collection('RunReportData').updateOne({run_name: runData['run_name']}, runData, {upsert: true}, function (err) {
		if (err) return console.error(err);
		db.close();
	});
});