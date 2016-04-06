// Script takes in run data output from perl script and uploads to mongo

var fs = require('fs');
var	mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://10.30.128.97:27017/seqwareBrowser';

var dateNow = new Date();

fs.readFile(process.argv[2], 'utf8', function (err, data) {
	if (err) console.error(err);
	console.log('starting run report data');
	runData = JSON.parse(data);

	MongoClient.connect(url, function(err, db) {
		if (err) return console.error(err);
		console.log('connected');

		// Return updated info to mongodb, insert if not already in db
		db.collection('RunReportDataPhasing').updateOne({_id: runData['_id']}, runData, {upsert: true}, function (err) {
			if (err) return console.error(err);
			db.close();
		});
	});
});