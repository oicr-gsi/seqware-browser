var fs = require('fs');
var _ = require('underscore');
var JSON = require('JSON');

function makeFile(data,db, callback) {
//export.makeFile = function (data,db) {
	var ids = [];
	//console.log(url);
	findReportDocumentsIUSSWID(ids, 'QC2', db, function (err) {
		fprDataLibrary = JSON.parse(data);
		//console.log(fprDataLibrary);
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
		return callback(obj);
	});
}

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

exports.findReportDocumentsIUSSWID=findReportDocumentsIUSSWID;
exports.makeFile=makeFile;