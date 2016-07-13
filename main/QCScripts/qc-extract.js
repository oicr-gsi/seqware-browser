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
		findReportDocumentsIUSSWID(ids, 'QC', db, function (err) {
			var newIUSSWID = _.difference(Object.keys(fprDataLibrary['Library']), ids);
			//console.log("there are %d new iusswids", newIUSSWID.length);
			var obj = "";
			for (var i=0; i<newIUSSWID.length;i++) {
				if (typeof fprDataLibrary['Library'][newIUSSWID[i]]['RNAZipFile'] !== 'undefined') {
					var load = "rna "+fprDataLibrary['Library'][newIUSSWID[i]]['RNAZipFile']+" "+newIUSSWID[i]+"\n";
				}
				else {
					if (typeof fprDataLibrary['Library'][newIUSSWID[i]]['JSON'] !== 'undefined') {
						var file = fprDataLibrary['Library'][newIUSSWID[i]]['JSON'];
					} else {
						var file = "n/a";
					}
					if (typeof fprDataLibrary['Library'][newIUSSWID[i]]['XenomeFile'] !== 'undefined') {
						var load= "dna "+file+" "+newIUSSWID[i]+" "+fprDataLibrary['Library'][newIUSSWID[i]]['XenomeFile']+"\n";
					} else {
						var load= "dna "+file+" "+newIUSSWID[i]+"\n";
					}
				}
				obj = obj.concat(load);		
			}
			console.log(obj);

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