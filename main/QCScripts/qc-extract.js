// determine what ius swids need to be added to the QC collection
//arguments: file prominance report, path to tmp dir
// Node Modules
var fs = require('fs');
var _ = require('underscore');
var config = require('config.js');
var JSON = require('JSON');
// Initialize mongo config
var	mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://' + config.mongo.host + '/' + config.mongo.database;

var analysisYAML;

fs.readFile(process.argv[2], 'utf8', function(err, data){
	if (err) return console.error(err);
	fprDataLibrary = JSON.parse(data);
	MongoClient.connect(url, function(err, db) {
		if (err) console.error(err);

		var ids = [];
		findReportDocumentsIUSSWID(ids, 'QCTest2', db, function (err) {
			var newIUSSWID = _.difference(Object.keys(fprDataLibrary['Library']), ids);
			console.log("there are %d new iusswids", newIUSSWID.length);
			var obj = [];
			for (var i=0; i<newIUSSWID.length;i++) {
				obj [i] = {};
				obj[i]['iusswid']=newIUSSWID[i];
				//console.log(obj['iusswid']);
				if (typeof fprDataLibrary['Library'][newIUSSWID[i]]['RNAZipFile'] !== 'undefined') {
					obj[i]['sampleType'] = "rna";
					obj[i]['RNAZipFile'] = fprDataLibrary['Library'][newIUSSWID[i]]['RNAZipFile'];
				}
				else {
					obj[i]['sampleType'] = "dna";
					if (typeof fprDataLibrary['Library'][newIUSSWID[i]]['JSON'] !== 'undefined') {
						obj[i]['JSON'] = fprDataLibrary['Library'][newIUSSWID[i]]['JSON'];
					} else {
						obj[i]['JSON'] = "n/a";
					}
					if (typeof fprDataLibrary['Library'][newIUSSWID[i]]['XenomeFile'] !== 'undefined') {
						obj[i]['XenomeFile'] = fprDataLibrary['Library'][newIUSSWID[i]]['XenomeFile'];
					}
				}		
			}
			//obj['count'] = newIUSSWID.length;
			var stream = fs.createWriteStream(process.argv[3]+"/newQCData.json");
			stream.once('open', function(fd) {
				stream.write(JSON.stringify(obj));
				stream.end();
			});

			db.close();
		});
	});	

});

/**
 * returns all report documents iusswids
 * @param {array} docs
 * @param {db} db
 * @param {function} callback
 * @return {array} docs
 */
function findReportDocumentsIUSSWID(docs, collection, db, callback) {
	var cursor = db.collection(collection).find();
	cursor.each(function(err, doc) {
		if (err) return console.error(err);
		if (doc != null) {
			docs.push(doc.iusswid.toString());
		} else {
			callback();
			return docs;
		}
	});
}