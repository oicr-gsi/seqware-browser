// Separate scripts require this script for all the functions to update data to mongodb

// Node Modules
var fs = require('fs');
var _ = require('underscore');
var YAML = require('yamljs');
var http = require("http");
var AdmZip = require('adm-zip');
var config = require('config.js');

// Initialize mongo config
var	mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://' + config.mongo.host + '/' + config.mongo.database;

// Initialize postgresql config
var pg = require('pg');
var cp = config.postgres;
var client = new pg.Client('postgres://' + cp.username + ':' + cp.password + '@' + cp.host + ':' + cp.port + '/' + cp.database);

var analysisYAML;

/////////////////////////////// Functions ///////////////////////////////

////////////////////////////// ProjectInfo /////////////////////////////
/** _id: project name
 * updates a list of projects and associated info
 * @param {json} projectData
 */
exports.updateProjectInfo = function (projectData) {
	MongoClient.connect(url, function(err, db) {
		var batch = db.collection('ProjectInfo').initializeUnorderedBulkOp();
		var projectInfo = getProjectDataInfo(projectData);

		// Get all project info
		for (var project in projectInfo) {
			var returnObj = {};
			returnObj['_id'] = project;
			// Convert date time to same format
			returnObj['start_date'] = getDateTimeString(projectInfo[project]['Start Date']);
			returnObj['last_mod'] = getDateTimeString(projectInfo[project]['Last Modified']);

			batch.find({_id: project}).upsert().updateOne(returnObj);
		}
		batch.execute(function(err, result) {
			if (err) console.dir(err);
			db.close();
		});
	});
}

///////////////////////////////// RunInfo ///////////////////////////////
/** _id: run name
 * updates a list of runs and associated info
 * @param {json} sequencerData 
 */
exports.updateRunInfo = function (sequencerData) {
	MongoClient.connect(url, function(err, db) {
		if (err) return console.error(err);
		var batch = db.collection('RunInfo').initializeUnorderedBulkOp();

		var running = [];
		var complete = [];

		// Connect with postgresql
		client.connect(function(err) {
			if (err) return console.error(err);
			// query for all workflow runs
			var query = 'SELECT sr.name AS sequencer_run_name FROM sequencer_run AS sr WHERE sr.file_path is not null AND sr.skip = \'f\' AND sr.create_tstmp > \'2014-02-01\';';

			client.query(query, function (err, result) {
				if (err) console.error(err);
				var jsonData = result.rows;

				// Get run information
				for (var i = 0; i < sequencerData.length; i++) {
					var returnObj = {};
					returnObj['_id'] = sequencerData[i].name;
					returnObj['start_date'] = getDateTimeString(sequencerData[i].created_date);
					returnObj['status'] = sequencerData[i].state;

					// Get all Running sequencer runs
					if (sequencerData[i].state === 'Running' && new Date(sequencerData[i].created_date) > new Date('2014-02-01 00:00:00')) {
						running.push(sequencerData[i].name); 
					}
					batch.find({_id: returnObj['_id']}).upsert().updateOne(returnObj);
				}

				// Query for running sequencer runs by 
				// sequencerData[i].state === 'Running' && new Date(sequencerData[i].created_date) > new Date('2014-02-01 00:00:00')
				for (var i = 0; i < jsonData.length; i++) {
					complete.push(jsonData[i].sequencer_run_name);
				}

				// Change status to 'Complete' if in psql database (even if status is running in pinery)
				var completed = _.intersection(running, complete);
				for (var i = 0; i < completed.length; i++) {
					batch.find({_id: completed[i]}).upsert().updateOne({ $set: {status: 'Completed'} });
				}

				batch.execute(function(err, result) {
					if (err) console.dir(err);
					db.close();
				});
				client.end();
			});
		});
	});
}

///////////////////////////////// DonorInfo ///////////////////////////////
/** _id: donor head
 * updates a list of donors heads and associated info
 * @param {json} sequencerData 
 * @param {json} sampleData
 */
exports.updateDonorInfo = function (sequencerData, sampleData) {
	MongoClient.connect(url, function(err, db) {
		var batch = db.collection('DonorInfo').initializeUnorderedBulkOp();
		var sampleIDInfo = getSampleIDInfo(sampleData);
		var returnObj = {};

		// Get all the donors (even if samples don't exist -> identity)
		for (var id in sampleIDInfo) {
			var donor;
			// Get all samples with sample_type: Identity
			if (sampleIDInfo[id]['Sample Type'] === 'Identity') {
				if (/(.*?_.*?)_/.test(sampleIDInfo[id]['Library Name'])) {
					var match = /(.*?_.*?)_/.exec(sampleIDInfo[id]['Library Name']);
					donor = match[1];
				} else {
					donor = sampleIDInfo[id]['Library Name'];
				}
			// Get all library heads
			} else if (/(.*?_.*?)_/.test(sampleIDInfo[id]['Library Name'])) {
				var match = /(.*?_.*?)_/.exec(sampleIDInfo[id]['Library Name']);
				donor = match[1];
			}
			if (typeof donor !== 'undefined') {
				returnObj[donor] = {};
				returnObj[donor]['_id'] = donor;
			}
		}

		// Get all donor information
		for (var i = 0; i < sequencerData.length; i++) {
			// Pooled Sample
			if (Object.prototype.toString.call(sequencerData[i].positions) === '[object Array]') {
				for (var j = 0; j < sequencerData[i].positions.length; j++) {
					for (var k = 0; k < sequencerData[i].positions[j].samples.length; k++) {
						var id = sequencerData[i].positions[j].samples[k].id;
						if (/Library Seq$/.test(sampleIDInfo[id]['Sample Type'])) {
							var libraryName = sampleIDInfo[id]['Library Name'];

							// donor information from libraries
							if (/((.*?)_.*?)_/.test(libraryName)) {
								var match = /((.*?)_.*?)_/.exec(libraryName);
								var donor = match[1];
								var donorHead = match[2]; // can sum up totals of donor heads (for runs and projects)

								if (typeof sampleIDInfo[donor] !== 'undefined') {
									if (typeof sampleIDInfo[donor]['Institute'] !== 'undefined') {
										returnObj[donor]['institute'] = sampleIDInfo[donor]['Institute'];
									} else {
										returnObj[donor]['institute'] = 'n/a';
									}
									if (typeof sampleIDInfo[donor]['External Name'] !== 'undefined') {
										returnObj[donor]['external_name'] = sampleIDInfo[donor]['External Name'];
									} else {
										returnObj[donor]['external_name'] = 'n/a';
									}
								}
								returnObj[donor]['donor_head'] = donorHead;
							}
						}
					}
				}
			// Single Sample
			} else if (typeof sequencerData[i].positions !== 'undefined') {
				var id = sequencerData[i].positions.id;
				if (/Library Seq$/.test(sampleIDInfo[id]['Sample Type'])) {
					var libraryName = sampleIDInfo[id]['Library Name'];

					// donor information from libraries
					if (/(.*?_.*?)_/.test(libraryName)) {
						var match = /((.*?)_.*?)_/.exec(libraryName);
						var donor = match[1];
						var donorHead = match[2]; // can sum up totals of donor heads (for runs and projects)

						if (typeof sampleIDInfo[donor] !== 'undefined') {
							if (typeof sampleIDInfo[donor]['Institute'] !== 'undefined') {
								returnObj[donor]['institute'] = sampleIDInfo[donor]['Institute'];
							} else {
								returnObj[donor]['institute'] = 'n/a';
							}
							if (typeof sampleIDInfo[donor]['External Name'] !== 'undefined') {
								returnObj[donor]['external_name'] = sampleIDInfo[donor]['External Name'];
							} else {
								returnObj[donor]['external_name'] = 'n/a';
							}
						}
						returnObj[donor]['donor_head'] = donorHead;
					}
				}
			}
		}
		for (var donor in returnObj) {
			batch.find({_id: donor}).upsert().updateOne(returnObj[donor]);
		}

		batch.execute(function(err, result) {
			if (err) console.dir(err);
			db.close();
		});
	});
}

/////////////////////////////// LibraryInfo /////////////////////////////////
/** _id: library_id (run.name||lane||template.id)
 * updates library information mongodb and inserts if it isn't in the collection
 * @param {json} sequencerData 
 * @param {json} sampleData
 * @param {json} skipData (psql query)
 * @param {json} receiveData (psql query)
 */
exports.updateLibraryInfo = function (sequencerData, sampleData, skipData, receiveData) {
	MongoClient.connect(url, function(err, db) {
		var batch = db.collection('LibraryInfo').initializeUnorderedBulkOp();
		var sampleIDInfo = getSampleIDInfo(sampleData);
		var sampleDateInfo = getLibraryCreatePrepDates(sampleData);
		var sampleSkipInfo = getLibrarySeqSkip(skipData);
		var sampleReceiveInfo = getLibraryReceiveDates(receiveData);
		var libraries = {};

		// Get individual library seq data
		for (var i = 0; i < sequencerData.length; i++) {
			// Pooled samples
			if (Object.prototype.toString.call(sequencerData[i].positions) === '[object Array]') {
				for (var j = 0; j < sequencerData[i].positions.length; j++) {
					for (var k = 0; k < sequencerData[i].positions[j].samples.length; k++) {
						var id = sequencerData[i].positions[j].samples[k].id; // template id
						var _id = sequencerData[i].name + '||' + sequencerData[i].positions[j].position + '||' + id; // library id is run_name || lane || template_id
						if (/Library Seq$/.test(sampleIDInfo[id]['Sample Type'])) {
							var libraryName = sampleIDInfo[id]['Library Name'];
							libraries[_id] = {};
							libraries[_id]._id = _id;
							libraries[_id].template_id = id;
							libraries[_id].library_name = sampleIDInfo[id]['Library Name'];
							libraries[_id].ProjectInfo_id = sampleIDInfo[id]['Project Name'];
							libraries[_id].RunInfo_id = sequencerData[i].name;
							libraries[_id].lane = sequencerData[i].positions[j].position;
							// Determine skip (t/f)
							if (typeof sampleSkipInfo[_id] !== 'undefined') {
								libraries[_id].skip = sampleSkipInfo[_id].skip;
							} else {
								libraries[_id].skip = 'n/a';
							}
							// Determine create and prepared dates
							if (typeof sampleDateInfo[id] !== 'undefined') {
								libraries[_id].create_date = sampleDateInfo[id]['create_date'];
								libraries[_id].prep_date = sampleDateInfo[id]['prep_date'];
							} else {
								libraries[_id].create_date = 'n/a';
								libraries[_id].prep_date = 'n/a';
							}

							// If library format is w/ 6 underscores
							// Determine tissue and library type
							if (/^.*?_.*?_.*?_.*?_.*?_.*?_.*?[^_]$/.test(libraryName)) {
								if (/.*_(.*?)$/.test(libraryName)) {
								var match = /.*_(.*?)$/.exec(libraryName);
								libraries[_id].library_type = match[1];
								}
								if (/.*?_.*?_.*?_(.*?)_/.test(libraryName)) {
									var match = /.*?_.*?_.*?_(.*?)_/.exec(libraryName);
									libraries[_id].tissue_type = match[1];
								}
							}
							// Donor
							// Assume all samples come from the donor (first two sections of library name)
							if (/((.*?)_.*?)_/.test(libraryName)) {
								var match = /((.*?)_.*?)_/.exec(libraryName);
								var donor = match[1];
								var libHead = match[2]; // can sum up totals of donor heads (for runs and donors)
								libraries[_id].DonorInfo_id = donor;
								libraries[_id].library_head = libHead; 
								if (typeof sampleIDInfo[donor] !== 'undefined') {
									if (typeof sampleIDInfo[donor]['Tissue Origin'] !== 'undefined') {
										libraries[_id].tissue_origin = sampleIDInfo[donor]['Tissue Origin'];
									} else {
										libraries[_id].tissue_origin = 'n/a';
									}
								}
								if (typeof sampleReceiveInfo[donor] !== 'undefined') {
									libraries[_id].receive_date = sampleReceiveInfo[donor];
								} else {
									libraries[_id].receive_date = 'n/a';
								}
							}
							if (typeof sequencerData[i].positions[j].samples[k].barcode !== 'undefined') {
								libraries[_id].barcode = sequencerData[i].positions[j].samples[k].barcode;
							} else {
								libraries[_id].barcode = 'noIndex';
							}
						}
					}
				}
			} else if (typeof sequencerData[i].positions !== 'undefined') {
				var id = sequencerData[i].positions.id;
				var _id = sequencerData[i].name + '||' + sequencerData[i].positions[j].position + '||' + id;
				if (/Library Seq$/.test(sampleIDInfo[id]['Sample Type'])) {
					var libraryName = sampleIDInfo[id]['Library Name'];
					libraries[_id] = {};
					libraries[_id]._id = _id;
					libraries[_id].template_id = id;
					libraries[_id].library_name = libraryName;
					libraries[_id].ProjectInfo_id = sampleIDInfo[id]['Project Name'];
					libraries[_id].RunInfo_id = sequencerData[i].name;
					libraries[_id].lane = sequencerData[i].positions.position;
					// Determine skip (t/f)
					if (typeof sampleSkipInfo[_id] !== 'undefined') {
						libraries[_id].skip = sampleSkipInfo[_id].skip;
					} else {
						libraries[_id].skip = 'n/a';
					}
					// Determine create and prepared dates
					if (typeof sampleDateInfo[id] !== 'undefined') {
						libraries[_id].create_date = sampleDateInfo[id]['create_date'];
						libraries[_id].prep_date = sampleDateInfo[id]['prep_date'];
					} else {
						libraries[_id].create_date = 'n/a';
						libraries[_id].prep_date = 'n/a';
					}

					// If library format is w/ 6 underscores
					// Determine tissue and library type
					if (/^.*?_.*?_.*?_.*?_.*?_.*?_.*?[^_]$/.test(libraryName)) {
						if (/.*_(.*?)$/.test(libraryName)) {
						var match = /.*_(.*?)$/.exec(libraryName);
						libraries[_id].library_type = match[1];
						}
						if (/.*?_.*?_.*?_(.*?)_/.test(libraryName)) {
							var match = /.*?_.*?_.*?_(.*?)_/.exec(libraryName);
							libraries[_id].tissue_type = match[1];
						}
					}
					// Assume all samples come from the same donor
					if (/((.*?)_.*?)_/.test(libraryName)) {
						var match = /((.*?)_.*?)_/.exec(libraryName);
						var donor = match[1];
						var libHead = match[2]; // can sum up totals of donor heads (for runs and donors)
						libraries[_id].DonorInfo_id = donor;
						libraries[_id].library_head = libHead;
						if (typeof sampleIDInfo[donor] !== 'undefined') {
							if (typeof sampleIDInfo[donor]['Tissue Origin'] !== 'undefined') {
								libraries[_id].tissue_origin = sampleIDInfo[donor]['Tissue Origin'];
							} else {
								libraries[_id].tissue_origin = 'n/a';
							}
						}
						if (typeof sampleReceiveInfo[donor] !== 'undefined') {
							libraries[_id].receive_date = sampleReceiveInfo[donor];
						} else {
							libraries[_id].receive_date = 'n/a';
						}
					}

					if (typeof sequencerData[i].positions.barcode !== 'undefined') {
						libraries[_id].barcode = sequencerData[i].positions.barcode;
					} else {
						libraries[_id].barcode = 'noIndex';
					}
				}
			}
		}
		for (var id in libraries) {
			batch.find({_id: id}).upsert().updateOne(libraries[id]);
		}
		batch.execute(function(err, result) {
			if (err) console.dir(err);
			db.close();
		});
	});
}

/**
 * returns the sample prep and library creation dates by template ID
 * @param {json} sampleData
 * @return {object} dateInfo (create and prep)
 */
function getLibraryCreatePrepDates(sampleData) {
	var IUSsampleObj = {};
	var parentObj = {};
	var returnObj = {};

	// To get create date
	for (var i = 0; i < sampleData.length; i++) {
		var id = sampleData[i].id;
		// If the sample library seq and has parents, get the parents (this is for IUS Sample Parents)
		if (/Library Seq$/.test(sampleData[i].sample_type) && typeof sampleData[i].parents !== 'undefined') { 
			IUSsampleObj[id] = {};
			IUSsampleObj[id]['IUS Sample Name'] = sampleData[i].name;
			IUSsampleObj[id]['Create Date'] = getDateTimeString(sampleData[i].created_date);

			if (/\/(\d*)$/.test(sampleData[i].parents[0])) {
				var match = /\/(\d*)$/.exec(sampleData[i].parents[0]);
				IUSsampleObj[id]['Parent ID'] = match[1];
			}
		} else { // Not a library seq (parents) everything else
			parentObj[id] = {};
			parentObj[id]['Parent Library Name'] = sampleData[i].name;
			parentObj[id]['Create Date'] = getDateTimeString(sampleData[i].created_date);
			parentObj[id]['Sample Type'] = sampleData[i].sample_type;
			if (typeof sampleData[i].parents !== 'undefined') {
				// get the parent id
				if (/\/(\d*)$/.test(sampleData[i].parents[0])) {
					var match = /\/(\d*)$/.exec(sampleData[i].parents[0]);
					parentObj[id]['Parent ID'] = match[1];
				}
			} else {
				parentObj[id]['Parent ID'] = 'Identity';
			}
		}
	}

	// Check if IUS library seq parent is the sample right before the IUS library in the sample hierarchy
	// Library Date
	for (var id in IUSsampleObj) {
		var parentID = IUSsampleObj[id]['Parent ID'];
		returnObj[id] = {};
		if (typeof parentObj[parentID] === 'undefined') { // If the parent is from another IUS sample
			returnObj[id]['create_date'] = IUSsampleObj[parentID]['Create Date'];
			parentID = IUSsampleObj[parentID]['Parent ID'];
		} else {
			returnObj[id]['create_date'] = parentObj[parentID]['Create Date'];
		}

		// Determine Prep date by climbing up sample hierarchy
		if (parentObj[parentID]['Parent ID'] === 'Identity') { // if parent is donor
			returnObj[id]['prep_date'] = parentObj[parentID]['Create Date'];
		} else {
			// Keep iterating through hierarchy until the sample type does not end with 'Library'
			while (/Library$/.test(parentObj[parentID]['Sample Type']) && parentObj[parentID]['Parent ID'] !== 'Identity') {
				parentID = parentObj[parentID]['Parent ID'];
			}
			returnObj[id]['prep_date'] = parentObj[parentID]['Create Date'];
		}
	}

	return returnObj;
}

/**
 * returns the library and if it was skipped or not (t/f)
 * @param {json} jsonData (psql query)
 * @return {object} dateInfo (create and prep)
 */
function getLibrarySeqSkip(jsonData) {
	var obj = {};
	for (var i = 0; i < jsonData.length; i++) {
		var library_id = jsonData[i].library_id;
		if (typeof obj[library_id] === 'undefined') {
			obj[library_id] = {};
			obj[library_id]['skip'] = 0;
		}
		if (jsonData[i].skip == true) {
			obj[library_id]['skip']++;
		}
	}

	return obj;
}

/**
 * returns the library receive dates by template id
 * @param {json} jsonData (psql query)
 * @return {object} dateInfo (receive)
 */
function getLibraryReceiveDates(jsonData) {
	var obj = {};

	for (var i = 0; i < jsonData.length; i++) {
		if (/(.*?_.*?)_/.test(jsonData[i].name) && /_1$/.test(jsonData[i].name)) {
			var match = /(.*?_.*?)_/.exec(jsonData[i].name);
			obj[match[1]] = jsonData[i].value;
		}
	}

	return obj;
}

///////////////////////////////// WorkflowInfo /////////////////////////////////
/** _id: workflowSWID
 * updates data from seqware database and updates mongodb Library, Run, Date, and Workflow collections
 * @param {yaml} analysisYAML
 */
exports.updateWorkflowInfo = function (analysisYAML) {
	MongoClient.connect(url, function(err, db) {
		var libBatch = db.collection('LibraryInfo').initializeUnorderedBulkOp();
		var wfBatch = db.collection('WorkflowInfo').initializeUnorderedBulkOp();
		var libraryObj = {};

		// Connect with postgresql
		client.connect(function(err) {
			if (err) return console.error(err);
			// query for all workflow runs
			var query = 'WITH RECURSIVE workflow_run_set AS ( SELECT workflow_run_id from workflow_run),workflow_run_processings (workflow_run_id, processing_id) AS ( SELECT wr.workflow_run_id, p.processing_id from workflow_run wr JOIN workflow_run_set wrs ON wr.workflow_run_id = wrs.workflow_run_id JOIN processing p ON (wr.workflow_run_id = p.workflow_run_id or wr.workflow_run_id = p.ancestor_workflow_run_id) UNION SELECT p.workflow_run_id, pr.parent_id FROM workflow_run_processings p JOIN processing_relationship pr ON p.processing_id = pr.child_id), total_workflow_run_ius AS (SELECT wr.workflow_run_id, i.ius_id FROM workflow_run wr  JOIN workflow_run_set wrs ON wr.workflow_run_id = wrs.workflow_run_id JOIN ius_workflow_runs iwr ON wr.workflow_run_id = iwr.workflow_run_id  JOIN ius i ON iwr.ius_id = i.ius_id UNION SELECT wrp.workflow_run_id, i.ius_id FROM workflow_run_processings wrp JOIN processing_ius pi ON wrp.processing_id = pi.processing_id JOIN ius i ON pi.ius_id = i.ius_id),workflow_run_template_ids AS (SELECT twri.workflow_run_id, array_agg(sa.value) as template_id, array_agg(sr.name || \'||\' || l.lane_index+1 || \'||\' || sa.value || \'||\' || i.sw_accession) as LibraryInfo_id FROM total_workflow_run_ius twri JOIN ius i ON twri.ius_id = i.ius_id JOIN lane AS l ON i.lane_id = l.lane_id JOIN sequencer_run AS sr ON l.sequencer_run_id = sr.sequencer_run_id JOIN sample s ON i.sample_id = s.sample_id JOIN sample_attribute sa ON s.sample_id = sa.sample_id WHERE sa.tag = \'geo_template_id\' GROUP BY twri.workflow_run_id ) SELECT wr.sw_accession as _id,wr.workflow_run_id,wr.status,wr.status_cmd,wr.create_tstmp,COALESCE(p.last_modified, wr.create_tstmp) as last_modified,w.name || \'_\' || w.version as workflow_name, wrti.template_id, wrti.LibraryInfo_id FROM workflow_run_set wrs JOIN workflow_run wr ON wrs.workflow_run_id = wr.workflow_run_id JOIN workflow_run_template_ids wrti ON wrs.workflow_run_id = wrti.workflow_run_id  JOIN workflow AS w ON wr.workflow_id = w.workflow_id LEFT OUTER JOIN (SELECT workflow_run_id, MAX(update_tstmp) AS last_modified FROM processing GROUP BY workflow_run_id ) AS p ON p.workflow_run_id = wr.workflow_run_id;';

			client.query(query, function (err, result) {
				if (err) console.error(err);
				var jsonData = result.rows;

				for (var i = 0; i < jsonData.length; i++) {
					// Update WorkflowInfo
					var WorkflowInfo_id = jsonData[i]._id;
					if (/(.*?)_.*?/.test(jsonData[i].workflow_name)) {
						var match = /(.*?)_.*?/.exec(jsonData[i].workflow_name);
						var workflowName = match[1];
						// Determine workflow analysis type by comparing to analysis YAML file
						for (var analysisType in analysisYAML) {
							if (workflowName in analysisYAML[analysisType]) {
								jsonData[i].analysis_type = analysisType;
							}
						}
					}
					jsonData[i].create_tstmp = getDateTimeString(jsonData[i].create_tstmp);
					jsonData[i].last_modified = getDateTimeString(jsonData[i].last_modified);

					for (var j = 0; j < jsonData[i].libraryinfo_id.length; j++) {
						// Parse out ids from libraryinfo_id
						var match = /(.*?\|\|.*?\|\|.*?)\|\|(.*?)$/.exec(jsonData[i].libraryinfo_id[j]);
						var librarySeq_id = match[1];
						var iusswid = match[2];

						// Update workflow info library ids to library seq ids
						jsonData[i].libraryinfo_id[j] = librarySeq_id;

						// Update workflows for each library id
						if (typeof libraryObj[librarySeq_id] === 'undefined') {
							libraryObj[librarySeq_id] = {};
							libraryObj[librarySeq_id]['WorkflowInfo_id'] = [];
							libraryObj[librarySeq_id]['iusswid'] = iusswid; //only for libraries with workflows 
						}
						libraryObj[librarySeq_id]['WorkflowInfo_id'].push(WorkflowInfo_id);
					}

					// Update workflow information batch
					// Do not update with library_ids, omit
					jsonData[i] = _.omit(jsonData[i], ['libraryinfo_id', 'template_id']);
					wfBatch.find({'_id':jsonData[i]._id}).upsert().updateOne(jsonData[i]);
				}

				// Sets the workflow arrays and iusswid in LibraryInfo collection
				for (var librarySeq_id in libraryObj) {
					var setMod = { $set:{} };
					setMod.$set = libraryObj[librarySeq_id];
					libBatch.find({_id: librarySeq_id}).upsert().updateOne(setMod);
				}
				
				wfBatch.execute(function(err, result) {
					if (err) console.dir(err);
				})
				libBatch.execute(function(err, result) {
					if (err) console.dir(err);
					db.close();
				});
				client.end();
			});
		});
	});
}

///////////////////////////////// FilesInfo ////////////////////////////////////
/** _id: fileSWID
 * updates mongodb list of files and links to associated WorkflowInfo_id
 * @param {file-json} fprData
 */
exports.updateFileInfo = function (fprData) {
	MongoClient.connect(url, function (err, db) {
		var batch = db.collection('FileInfo').initializeUnorderedBulkOp();

		// search file provenance report for file data
		for (var fileSWID in fprData['File']) {
			var obj = {};
			obj['_id'] = fileSWID;
			obj['file_path'] = fprData['File'][fileSWID]['Path'];
			obj['WorkflowInfo_id'] = fprData['File'][fileSWID]['WorkflowSWID'];

			batch.find({_id: fileSWID}).upsert().updateOne(obj);
		}
		batch.execute(function(err, result) {
			if (err) console.dir(err);
			db.close();
		});
	});
}

//// Dynamic Info

/**
 * checks for running workflow runs in seqware database
 * does a check for existing workflow runs in mongodb
 * @param {yaml} fprData
 */
exports.updateRunningWorkflowRuns = function (analysisYAML) {
	// Query for all with status = 'running' and update the CurrentWorkflowRuns table
	// Query all ids in the 'CurrentWorkflowRuns' collection and update all in WorkflowInfo table

	MongoClient.connect(url, function(err, db) {
		if (err) return console.error(err);
		var currentWFBatch = db.collection('CurrentWorkflowRuns').initializeUnorderedBulkOp();
		var failedWFBatch = db.collection('FailedWorkflowRuns').initializeUnorderedBulkOp();
		var wfBatch = db.collection('WorkflowInfo').initializeUnorderedBulkOp();

		var docs = [];
		findAllDocuments(docs, 'CurrentWorkflowRuns', db, function() {
			// If ids exist, add to query, else just search for status = 'running'
			var ids;
			if (docs.length > 0) {
				ids = 'sw_accession in ( ' + docs.join() + ') or';
			} else {
				ids = '';
			}

			// Connect to postgresql client
			client.connect(function(err) {
				if (err) return console.error(err);
				var query = 'WITH RECURSIVE workflow_run_set AS (SELECT workflow_run_id from workflow_run where ' + ids + ' status = \'running\'), workflow_run_processings (workflow_run_id, processing_id) AS (SELECT wr.workflow_run_id, p.processing_id from workflow_run wr JOIN workflow_run_set wrs ON wr.workflow_run_id = wrs.workflow_run_id JOIN processing p ON (wr.workflow_run_id = p.workflow_run_id or wr.workflow_run_id = p.ancestor_workflow_run_id) UNION SELECT p.workflow_run_id, pr.parent_id FROM workflow_run_processings p JOIN processing_relationship pr ON p.processing_id = pr.child_id), total_workflow_run_ius AS (SELECT wr.workflow_run_id, i.ius_id FROM workflow_run wr  JOIN workflow_run_set wrs ON wr.workflow_run_id = wrs.workflow_run_id JOIN ius_workflow_runs iwr ON wr.workflow_run_id = iwr.workflow_run_id  JOIN ius i ON iwr.ius_id = i.ius_id UNION SELECT wrp.workflow_run_id, i.ius_id FROM workflow_run_processings wrp JOIN processing_ius pi ON wrp.processing_id = pi.processing_id JOIN ius i ON pi.ius_id = i.ius_id),workflow_run_template_ids AS (SELECT twri.workflow_run_id, array_agg(sa.value) as template_id, array_agg(sr.name || \'||\' || l.lane_index+1 || \'||\' || sa.value || \'||\' || i.sw_accession) as LibraryInfo_id FROM total_workflow_run_ius twri JOIN ius i ON twri.ius_id = i.ius_id JOIN lane AS l ON i.lane_id = l.lane_id JOIN sequencer_run AS sr ON l.sequencer_run_id = sr.sequencer_run_id JOIN sample s ON i.sample_id = s.sample_id JOIN sample_attribute sa ON s.sample_id = sa.sample_id WHERE sa.tag = \'geo_template_id\' GROUP BY twri.workflow_run_id ) SELECT wr.sw_accession as _id,wr.workflow_run_id,wr.status,wr.status_cmd,wr.create_tstmp,COALESCE(p.last_modified, wr.create_tstmp) as last_modified,w.name || \'_\' || w.version as workflow_name, wrti.template_id, wrti.LibraryInfo_id FROM workflow_run_set wrs JOIN workflow_run wr ON wrs.workflow_run_id = wr.workflow_run_id JOIN workflow_run_template_ids wrti ON wrs.workflow_run_id = wrti.workflow_run_id  JOIN workflow AS w ON wr.workflow_id = w.workflow_id LEFT OUTER JOIN (SELECT workflow_run_id, MAX(update_tstmp) AS last_modified FROM processing GROUP BY workflow_run_id ) AS p ON p.workflow_run_id = wr.workflow_run_id;';
				//console.log(query);

				client.query(query, function (err, result) {
					if (err) console.error(err);

					for (var i = 0; i < result.rows.length; i++) {
						// Update workflow info
						var WorkflowInfo_id = result.rows[i]._id;
						if (/(.*?)_.*?/.test(result.rows[i].workflow_name)) {
							var match = /(.*?)_.*?/.exec(result.rows[i].workflow_name);
							var workflowName = match[1];
							// Determine workflow analysis type by matching name within analysis YAML file
							for (var analysisType in analysisYAML) {
								if (workflowName in analysisYAML[analysisType]) {
									result.rows[i].analysis_type = analysisType;
								}
							}
						}
						
						result.rows[i].create_tstmp = getDateTimeString(result.rows[i].create_tstmp);
						result.rows[i].last_modified = getDateTimeString(result.rows[i].last_modified);

						// Do not update with library_ids, omit
						result.rows[i] = _.omit(result.rows[i], ['libraryinfo_id', 'template_id']);

						// Update running workflow collection
						if (result.rows[i].status === 'running') {
							currentWFBatch.find({_id: result.rows[i]._id}).upsert().updateOne(result.rows[i]);
							wfBatch.find({_id: result.rows[i]._id}).upsert().updateOne(result.rows[i]);
						// Update failed workflow collection and workflow info table, remove from running workflow collection
						} else if (result.rows[i].status === 'failed') {
							currentWFBatch.find({_id: result.rows[i]._id}).removeOne();
							failedWFBatch.find({_id: result.rows[i]._id}).upsert().updateOne(result.rows[i]);
							wfBatch.find({_id: result.rows[i]._id}).upsert().updateOne(result.rows[i]);
						// Update completed workflows
						} else {
							currentWFBatch.find({_id: result.rows[i]._id}).removeOne();
							wfBatch.find({_id: result.rows[i]._id}).upsert().updateOne(result.rows[i]);
						}
					}
					currentWFBatch.execute(function(err, result) {
						if (err) console.dir(err);
					});
					if (failedWFBatch.s.currentBatch !== null) {
						failedWFBatch.execute(function(err, result) {
							if (err) console.dir(err);
						});
					}
					wfBatch.execute(function(err, result) {
						if (err) console.dir(err);
						db.close();
					});
					client.end();
				});				
			});
		});
	});
}

/**
 * checks the failed workflow run table for change in status and updates accordingly
 */
function checkFailedWorkflowRuns () {
	MongoClient.connect(url, function(err, db) {
		if (err) return console.error(err);
		var failedWFBatch = db.collection('FailedWorkflowRuns').initializeUnorderedBulkOp();
		var wfBatch = db.collection('WorkflowInfo').initializeUnorderedBulkOp();

		var docs = [];
		findAllDocuments(docs, 'FailedWorkflowRuns', db, function() {
			if (typeof docs !== 'undefined') {

				// Connect to postgresql client
				client.connect(function(err) {
					if (err) return console.error(err);
					var query = 'WITH RECURSIVE workflow_run_set AS (SELECT workflow_run_id from workflow_run where sw_accession in ( ' + docs.join() + ' ) ), workflow_run_processings (workflow_run_id, processing_id) AS (SELECT wr.workflow_run_id, p.processing_id from workflow_run wr JOIN workflow_run_set wrs ON wr.workflow_run_id = wrs.workflow_run_id JOIN processing p ON (wr.workflow_run_id = p.workflow_run_id or wr.workflow_run_id = p.ancestor_workflow_run_id) UNION SELECT p.workflow_run_id, pr.parent_id FROM workflow_run_processings p JOIN processing_relationship pr ON p.processing_id = pr.child_id), total_workflow_run_ius AS (SELECT wr.workflow_run_id, i.ius_id FROM workflow_run wr  JOIN workflow_run_set wrs ON wr.workflow_run_id = wrs.workflow_run_id JOIN ius_workflow_runs iwr ON wr.workflow_run_id = iwr.workflow_run_id  JOIN ius i ON iwr.ius_id = i.ius_id UNION SELECT wrp.workflow_run_id, i.ius_id FROM workflow_run_processings wrp JOIN processing_ius pi ON wrp.processing_id = pi.processing_id JOIN ius i ON pi.ius_id = i.ius_id),workflow_run_template_ids AS (SELECT twri.workflow_run_id, array_agg(sa.value) as template_id, array_agg(sr.name || \'||\' || l.lane_index+1 || \'||\' || sa.value || \'||\' || i.sw_accession) as LibraryInfo_id FROM total_workflow_run_ius twri JOIN ius i ON twri.ius_id = i.ius_id JOIN lane AS l ON i.lane_id = l.lane_id JOIN sequencer_run AS sr ON l.sequencer_run_id = sr.sequencer_run_id JOIN sample s ON i.sample_id = s.sample_id JOIN sample_attribute sa ON s.sample_id = sa.sample_id WHERE sa.tag = \'geo_template_id\' GROUP BY twri.workflow_run_id ) SELECT wr.sw_accession as _id,wr.workflow_run_id,wr.status,wr.status_cmd,wr.create_tstmp,COALESCE(p.last_modified, wr.create_tstmp) as last_modified,w.name || \'_\' || w.version as workflow_name, wrti.template_id, wrti.LibraryInfo_id FROM workflow_run_set wrs JOIN workflow_run wr ON wrs.workflow_run_id = wr.workflow_run_id JOIN workflow_run_template_ids wrti ON wrs.workflow_run_id = wrti.workflow_run_id  JOIN workflow AS w ON wr.workflow_id = w.workflow_id LEFT OUTER JOIN (SELECT workflow_run_id, MAX(update_tstmp) AS last_modified FROM processing GROUP BY workflow_run_id ) AS p ON p.workflow_run_id = wr.workflow_run_id;';
					
					client.query(query, function (err, result) {
						if (err) console.error(err);

						for (var i = 0; i < result.rows.length; i++) {
							if (result.rows[i].status !== 'failed') {
								// Update workflow info
								var WorkflowInfo_id = parseInt(result.rows[i]._id);
								if (/(.*?)_.*?/.test(result.rows[i].workflow_name)) {
									var match = /(.*?)_.*?/.exec(result.rows[i].workflow_name);
									var workflowName = match[1];
									// Determine analysis type by comparning workflow name within analysis YAML file
									for (var analysisType in analysisYAML) {
										if (workflowName in analysisYAML[analysisType]) {
											result.rows[i].analysis_type = analysisType;
										}
									}
								}
								result.rows[i].create_tstmp = getDateTimeString(result.rows[i].create_tstmp);
								result.rows[i].last_modified = getDateTimeString(result.rows[i].last_modified);

								// Do not update with library_ids, omit
								result.rows[i] = _.omit(result.rows[i], ['libraryinfo_id', 'template_id']);

								failedWFBatch.find({_id: result.rows[i]._id}).removeOne();
								wfBatch.find({_id: result.rows[i]._id}).upsert().updateOne(result.rows[i]);
							}
						}

						failedWFBatch.execute(function(err, result) {
							if (err) console.dir(err);
						});
						wfBatch.execute(function(err, result) {
							if (err) console.dir(err);
							db.close();
						});
						client.end();
					});
				});
			}
		});
	});
}

//// Reporting Functions (detail pages)

/**
 * returns json report data and % mouse content from xenome file
 * @param {json} jsonFile
 * @param {log} xenomeFile
 * @return {object} reportData
 */
function getReportData(jsonFile, xenomeFile) {
	var obj = {};
	if (typeof jsonFile !== 'undefined') {
		var jsonString = fs.readFileSync(jsonFile, 'utf8'); 
		var lineObj = JSON.parse(jsonString);

		// Initialize
		var readsSP = parseFloat(lineObj['reads per start point']).toFixed(2);
		var onTargetRate = lineObj['reads on target']/lineObj['mapped reads'];

		// Reads per start point
		obj['Reads/SP'] = readsSP;

		// Map %, Raw Reads, Raw Yield
		var rawReads = (parseInt(lineObj['mapped reads']) + parseInt(lineObj['unmapped reads']) + parseInt(lineObj['qual fail reads']));

		if (rawReads > 0) {
			obj['Map %'] = ((lineObj['mapped reads']/rawReads)*100).toFixed(2) + '%';
			obj['Reads'] = rawReads;
			obj['Yield'] = parseInt(rawReads*lineObj['average read length']);
		} else {
			obj['Map %'] = 0;
			obj['Reads'] = 0;
			obj['Yield'] = 0;
		}

		// % on Target
		obj['% on Target'] = (onTargetRate*100).toFixed(2) + '%';

		// Insert mean, insert stdev, read length
		if (lineObj['number of ends'] === 'paired end') {
			obj['Insert Mean'] = parseFloat(lineObj['insert mean']).toFixed(2);
			obj['Insert Stdev'] = parseFloat(lineObj['insert stdev']).toFixed(2);
			obj['Read Length'] = lineObj['read 1 average length'] + ',' + lineObj['read 2 average length'];
		} else {
			obj['Insert Mean'] = 'n/a';
			obj['Insert Stdev'] = 'n/a';
			obj['Read Length'] = lineObj['read ? average length'];
		}

		// Coverage
		var rawEstYield = lineObj['aligned bases'] * onTargetRate;
		var collapsedEstYield = rawEstYield/readsSP;

		obj['Coverage (collapsed)'] = (collapsedEstYield/lineObj['target size']).toFixed(2);
		obj['Coverage (raw)'] = (rawEstYield/lineObj['target size']).toFixed(2);
	}

	// Get Mouse Data
	if (typeof xenomeFile !== 'undefined') {
		var xenomeLog = fs.readFileSync(xenomeFile, 'utf8');
		var lines = xenomeLog.toString().split('\n');
		var match;
		for (var i = 0; i < lines.length; i++){
			if (/\t(.*)\tmouse?/.test(lines[i])) {
				match = /\t(.*)\tmouse?/.exec(lines[i]);
			}
		}
		obj['% Mouse Content'] = parseFloat(match[1]).toFixed(2);
	} else {
		obj['% Mouse Content'] = 'N/A';
	}
	return obj;
}

/** _id: IUSSWID
 * updates report data from json file and xenome file into mongodb
 * @param {json} fprData
 */
exports.updateIUSSWIDReportData = function (fprData) {
	// ALL DATA BASED ON REPORTS FROM JSON FILES
	MongoClient.connect(url, function(err, db) {
		if (err) console.error(err);
		var batch = db.collection('IUSSWIDReportData').initializeUnorderedBulkOp();
		// Individual library report data
		for (var IUSSWID in fprData['Library']) {
			var json = fprData['Library'][IUSSWID]['JSON'];
			var xenomeFile = fprData['Library'][IUSSWID]['XenomeFile'];
			var obj = {};
			obj = getReportData(json, xenomeFile);
			obj['_id'] = IUSSWID;

			//Update in mongodb
			batch.find({_id: IUSSWID}).upsert().updateOne(obj);
		}
		batch.execute(function(err, result) {
			if (err) console.dir(err);
			db.close();
		});
	});
}

/**
 * returns an object of all alignment QC RNA Seq data
 * @param {zip} zipFile
 * @return {object} RNASeqQCData
 */
function getRNASeqQCData(zipFile) {
	var zip = new AdmZip(zipFile);
	var zipEntries = zip.getEntries();
	var dir = zipEntries[0].entryName;
	var obj = {};

	var picard;
	var metrics;
	var uniq;
	var contam;
	var TOTAL_READS = 0;
	var RIBOSOMAL_READS;
	var UNIQ_READS;
	var START_POINTS;

	// Read from zip files without extracting
	zipEntries.forEach(function(zipEntry) {
		// Data
		if (zipEntry.name === 'CollectRNASeqMetricsSummary.txt'){
			picard = zipEntry.getData().toString('utf8').split('\n');
			metrics = picard[1].split('\t');
		} else if (zipEntry.name === 'ReadsPerStartPoint.txt'){
			uniq = zipEntry.getData().toString('utf8').split('\n');
		} else if (zipEntry.name === 'rRNAcontaminationSummary.txt'){
			contam = zipEntry.getData().toString('utf8').split('\n');
		// Graphs (images to base64)
		} else if (zipEntry.name === 'pieChart.jpeg'){
			//console.log(zipEntry.getData().toString());
			obj['Bases Breakdown'] = zipEntry.getData().toString('base64');
		} else if (/.*\.junctionSaturation_plot\.jpeg/.test(zipEntry.name)){
			obj['Junction Saturation'] = zipEntry.getData().toString('base64');
		} else if (/.*\.geneBodyCoverage\.curves\.jpeg/.test(zipEntry.name) || /.*\.geneBodyCoverage\.jpeg/.test(zipEntry.name)){
			obj['RSeQC Gene Body Coverage'] = zipEntry.getData().toString('base64');
		}
	});

	//Parse Metrics
	// Read/Start Point Metrics
	UNIQ_READS = uniq[0];
	START_POINTS = uniq[1]+'\n';
	// RNA Summary Metrics
	for (var i = 0; i < contam.length; i++) {
		if (/total/.exec(contam[i])) {
			var parts = contam[i].split(' ');
			TOTAL_READS = parts[0];
		}
		if (/0 mapped/.exec(contam[i])) {
			var parts = contam[i].split(' ');
			RIBOSOMAL_READS = parts[0];
		}
	}
	
	// Picard
	var PF_BASES=metrics[0];
	var PF_ALIGNED_BASES=metrics[1];
	//***var RIBOSOMAL_BASES=metrics[2];
	var CODING_BASES=metrics[3];
	var UTR_BASES=metrics[4];
	var INTRONIC_BASES=metrics[5];
	var INTERGENIC_BASES=metrics[6];
	var IGNORED_READS=metrics[7];
	var CORRECT_STRAND_READS=metrics[8];
	var INCORRECT_STRAND_READS=metrics[9];
	var PCT_RIBOSOMAL_BASES=metrics[10];
	var PCT_CODING_BASES=metrics[11];
	var PCT_UTR_BASES=metrics[12];
	var PCT_INTRONIC_BASES=metrics[13];
	var PCT_INTERGENIC_BASES=metrics[14];
	var PCT_MRNA_BASES=metrics[15];
	var PCT_USABLE_BASES=metrics[16];
	var PCT_CORRECT_STRAND_READS=metrics[17];
	var MEDIAN_CV_COVERAGE=metrics[18];
	var MEDIAN_5PRIME_BIAS=metrics[19];
	var MEDIAN_3PRIME_BIAS=metrics[20];
	var MEDIAN_5PRIME_TO_3PRIME_BIAS=metrics[21];

	// Add to object
	obj['Total Reads'] = TOTAL_READS; // including unaligned
	obj['Uniq Reads'] = UNIQ_READS;
	// Reads per start point
	if (START_POINTS != 0) {
		obj['Reads/SP'] = (UNIQ_READS/START_POINTS).toFixed(2);
	} else {
		obj['Reads/SP'] = '#Start Points Job Failed -> rerun!'
	}
	obj['Yield'] = PF_BASES; // Passed Filter Bases
	/*
	obj['Passed Filter Aligned Bases'] = PF_ALIGNED_BASES;
	obj['Coding Bases'] = CODING_BASES;
	obj['UTR Bases'] = UTR_BASES;
	obj['Intronic Bases'] = INTRONIC_BASES;
	obj['Intergenic Bases'] = INTERGENIC_BASES;
	if (CORRECT_STRAND_READS !== 0) {
		obj['Correct Strand Reads'] = CORRECT_STRAND_READS;
	} else {
		obj['Correct Strand Reads'] = 'Not a Strand Specific Library';
	}

	if (INCORRECT_STRAND_READS !== 0) {
		obj['Incorrect Strand Reads'] = INCORRECT_STRAND_READS;
	} else {
		obj['Incorrect Strand Reads'] = 'Not a Strand Specific Library';
	}

	obj['Proportion Coding Bases'] = PCT_CODING_BASES;
	obj['Proportion UTR Bases'] = PCT_UTR_BASES;
	obj['Proportion Intronic Bases'] = PCT_INTRONIC_BASES;
	obj['Proportion Intergenic Bases'] = PCT_INTERGENIC_BASES;
	obj['Proportion mRNA Bases'] = PCT_MRNA_BASES;
	obj['Proportion Usable Bases'] = PCT_USABLE_BASES;
	*/
	if (PCT_CORRECT_STRAND_READS !== 0) {
		obj['Proportion Correct Strand Reads'] = PCT_CORRECT_STRAND_READS;
	} else {
		obj['Proportion Correct Strand Reads'] = 'Not a Strand Specific Library';
	}
	//obj['Median CV Coverage'] = MEDIAN_CV_COVERAGE;
	//obj['Median 5Prime Bias'] = MEDIAN_5PRIME_BIAS;
	//obj['Median 3Prime Bias'] = MEDIAN_3PRIME_BIAS;
	obj['Median 5Prime to 3Prime Bias'] = MEDIAN_5PRIME_TO_3PRIME_BIAS;
	// rRNA Contamination (%reads aligned)
	if (TOTAL_READS !== 0) {
		obj['% rRNA Content'] = ((RIBOSOMAL_READS/TOTAL_READS)*100).toFixed(2);
	} else {
		obj['% rRNA Content'] = 'Total Reads Job Failed -> re-run report';
	}
	return obj;
}

/** _id: IUSSWID
 * returns all RNA Seq QC data to mongodb
 * @param {json} fprData
 */
exports.updateIUSSWIDRNASeqQCData = function (fprData) {
	MongoClient.connect(url, function(err, db) {
		if (err) console.error(err);
		var batch = db.collection('IUSSWIDRNASeqQCData').initializeUnorderedBulkOp();

		for (var IUSSWID in fprData['Library']) {
			if (typeof fprData['Library'][IUSSWID]['RNAZipFile'] !== 'undefined') {
				var obj = {};
				obj = getRNASeqQCData(fprData['Library'][IUSSWID]['RNAZipFile']);
				obj['_id'] = IUSSWID;

				//Update in mongodb
				batch.find({_id: IUSSWID}).upsert().updateOne(obj);
			}
		}
		batch.execute(function(err, result) {
			if (err) console.dir(err);
			db.close();
		});
	});
}

/** _id: IUSSWID
 * returns graph data
 * @param {json} fprData
 */
exports.updateGraphData = function (fprData) {
	// Charts generated using Google charts
	MongoClient.connect(url, function (err, db) {
		if (err) console.error(err);
		var batch = db.collection('IUSSWIDGraphData').initializeUnorderedBulkOp();
		for (var IUSSWID in fprData['Library']) {
			// Get graph data from JSON file
			if (typeof fprData['Library'][IUSSWID]['JSON'] !== 'undefined') {
				var jsonString = fs.readFileSync(fprData['Library'][IUSSWID]['JSON'], 'utf8');
				var lineObj = JSON.parse(jsonString);

				if (typeof lineObj['barcode'] === 'undefined'){
					lineObj['barcode'] = 'NoIndex';
				}
				var title = lineObj['run name'] + ' Lane: ' + lineObj['lane'] + ' Barcode: ' + lineObj['barcode'] + ' Library: ' + lineObj['library'];
				var graphData = {};
				graphData['_id'] = IUSSWID;
				graphData['Read Breakdown'] = {};
				graphData['Insert Distribution'] = {};
				graphData['Soft Clip by Cycle'] = {};
				graphData['Title'] = title;

				// pie chart - read breakdown
				// initialize variables
				var pieArray = ['Number'];
				var colors = ['#878BB6', '#4ACAB4', '#FF8153', '#FFEA88'];
				var labels = ['Reads', 'on target', 'off target', 'repeat/low quality', 'unmapped'];
				pieArray.push(parseInt(lineObj['mapped reads']));
				pieArray.push(parseInt(lineObj['mapped reads']) - parseInt(lineObj['reads on target']));
				pieArray.push(parseInt(lineObj['qual fail reads']));
				pieArray.push(parseInt(lineObj['unmapped reads']));

				graphData['Read Breakdown']['Colors'] = colors;
				graphData['Read Breakdown']['Labels'] = labels;
				graphData['Read Breakdown']['Data'] = pieArray;
				
				// area chart - insert distribution
				var xValInsert = [{label: 'Insert size', id: 'Insert size', type: 'number'}];
				var yValInsert = [{label: 'Pairs', id: 'Pairs', type: 'number'}];
				var insertColors = [{type: 'string', role: 'style'}];
				var red = '#FF4D4D';
				var yellow = '#FFFF4D';
				var green = '#A6FF4D';
				var insertMean = parseInt(lineObj['insert mean']);
				var histObj = lineObj['insert histogram'];
				var insertMax = 650;
				var insertStep = 50;
				for (var i in histObj) {
					if (i < insertMax) {
						xValInsert.push(i);
						yValInsert.push(histObj[i]);
					}
				}
				for (var i = 0; i < xValInsert.length; i++) {
					if ((xValInsert[i] < (insertMean - (2 * insertStep))) || (xValInsert[i] > (insertMean + (2 * insertStep)))) {
						insertColors.push(red);
					} else if ((xValInsert[i] < (insertMean - insertStep)) || (xValInsert[i] > (insertMean + insertStep))) {
						insertColors.push(yellow);
					} else {
						insertColors.push(green);
					}
				}

			    graphData['Insert Distribution']['x values'] = xValInsert;
			    graphData['Insert Distribution']['y values'] = yValInsert;
			    graphData['Insert Distribution']['Colors'] = insertColors;

			    // area chart - soft clip by cycle
				var readArray = ['read 1', 'read 2', 'read ?'];
				var alignedObj = {};
				var insertObj = {};
				for (var i = 0; i < readArray.length; i++) {
					alignedObj[readArray[i]] = {};
					insertObj[readArray[i]] = {};
					alignedObj[readArray[i]] = lineObj[readArray[i] + ' aligned by cycle'];
					insertObj[readArray[i]] = lineObj[readArray[i] + ' insertion by cycle'];
				}

				var xValSoft = [{label: 'Cycle', id: 'Cycle', type: 'number'}];
				var yValSoft = [{label: '% Bases Soft Clipped', id: '% Bases Soft Clipped', type: 'number'}];
				var read1max = 0;
				var errorObj;
				for (var i = 0; i < readArray.length; i++) {
					if (Object.keys(lineObj[readArray[i] + ' soft clip by cycle']).length > 0) {
						errorObj = lineObj[readArray[i] + ' soft clip by cycle'];
						for (var j in errorObj) {
							j = parseInt(j);
							if (lineObj['number of ends'] === 'single end'){
								xValSoft.push(j);
							} else {
								if (readArray[i] === 'read 1') {
									xValSoft.push(j);
									read1max++;
								} else if (readArray[i] === 'read 2') {
									xValSoft.push(j + read1max);
								}
							}
							if (alignedObj[readArray[i]][j] + insertObj[readArray[i]][j] + errorObj[j] > 0) {
								yValSoft.push((errorObj[j]/(alignedObj[readArray[i]][j] + errorObj[j] + insertObj[readArray[i]][j])) * 100);
							} else {
								yValSoft.push(0);
							}
						}
						if (readArray[i] === 'read 1') {
							xValSoft.push(read1max);
							yValSoft.push(0);
							read1max++;
						}
					}
				}

				graphData['Soft Clip by Cycle']['x values'] = xValSoft;
				graphData['Soft Clip by Cycle']['y values'] = yValSoft;

				// Update in mongodb
				batch.find({_id: IUSSWID}).upsert().updateOne(graphData);
			}
		}
		batch.execute(function(err, result) {
			if (err) console.dir(err);
			db.close();
		});
	});
}

/**
 * draws graphs by reading data produced by generateGraphDataByJSON and adding data to html given IUSSWID
 * @param {string} id
 */
 //drawGraphsById('8851');
function drawGraphsById(id) {
	// Retrieve mongodb data
	var pieValues;
	var pieOptions;
	var softLineValues;
	var softLineOptions;
	var insertLineValues;
	var insertLineOptions;

	MongoClient.connect(url, function(err, db) {
		if (err) return console.error(err);
		console.log('connect');

		db.collection('IUSSWIDGraphData').findOne({_id: id}, function (err, item){
			pieValues = _.zip(item['Read Breakdown']['Labels'], item['Read Breakdown']['Data']);
			pieOptions = {
				title: item['Title'] + ' Read Breakdown', 
				width: 600, height: 400, 
				colors: item['Read Breakdown']['Colors']
			};
			insertLineValues = _.zip(item['Insert Distribution']['x values'], item['Insert Distribution']['y values'], item['Insert Distribution']['Colors']);
			insertLineOptions = {
				title: item['Title'] + ' Insert Distribution', 
				width: 600, 
				height: 400, 
				lineWidth: 1, 
				hAxis: {
					title: 'Insert Size (bp)', 
					minValue: 0, 
					viewWindow: {
						min: 0
					}
				}, 
				vAxis: {
					title: 'Pairs'
				}, 
				legend: {
					position: 'none'
				}
			};
			softLineValues = _.zip(item['Soft Clip by Cycle']['x values'], item['Soft Clip by Cycle']['y values']);
			softLineOptions = {
				title: item['Title'] + ' Soft Clips by Cycle', 
				width: 600, 
				height: 400, 
				lineWidth: 1, 
				hAxis: {
					title: 'Cycle', 
					viewWindow: {
						min: 0
					}
				}, 
				vAxis: {
					title: '% Bases Soft Clipped', 
					maxValue: 100
				}, 
				colors: ['#FF4D4D'], 
				legend: {
					position: 'none'
				}
			};
		});			
	});

	// Output to html example
	fs.readFile('./graphTest.html', 'utf8', function (err, data) {
		if (err) return console.error(err);
		http.createServer(function (request, response) {
			response.writeHead(200, {'Content-Type': 'text/html'});
			
		    data = data.replace('{{pieData}}', JSON.stringify(pieValues));
		    data = data.replace('{{pieOptions}}', JSON.stringify(pieOptions));
		    data = data.replace('{{softLineData}}', JSON.stringify(softLineValues));
		    data = data.replace('{{softLineOptions}}', JSON.stringify(softLineOptions));
		    data = data.replace('{{insertDistributionData}}', JSON.stringify(insertLineValues));
		    data = data.replace('{{insertDistributionOptions}}', JSON.stringify(insertLineOptions));
		    
		    response.write(data);
		    response.end();
	    }).listen(8081);
	});
	console.log('Server running at http://127.0.0.1:8081/');
}

// Pinery
/**
 * returns parsed and modified sample information (extract sample attributes) to be used by updating functions
 * @param {json} sampleData
 * @return {object} sampleIDInfo
 */
function getSampleIDInfo(sampleData) {
	var returnObj = {};

	for (var i = 0; i < sampleData.length; i++) {
		returnObj[sampleData[i]['id']] = {};
		returnObj[sampleData[i]['id']]['Library Name'] = sampleData[i]['name'];
		returnObj[sampleData[i]['id']]['Start Date'] = sampleData[i]['created_date'];
		returnObj[sampleData[i]['id']]['Project Name'] = sampleData[i]['project_name'];
		returnObj[sampleData[i]['id']]['Sample Type'] = sampleData[i]['sample_type'];

		// Get attribute values (for donor information)
		if (typeof sampleData[i].attributes !== 'undefined') {
			for (var j = 0; j < sampleData[i].attributes.length; j++) {
				// Assuming all samples with the same donor head come from the same institute
				var donor;
				if (/(.*?_.*?)_/.test(sampleData[i].name)) {
					var match = /(.*?_.*?)_/.exec(sampleData[i].name);
					donor = match[1];
				} else {
					donor = sampleData[i].name;
				}
				if (sampleData[i].attributes[j].name === 'Institute') {
					if (typeof returnObj[donor] === 'undefined') {
						returnObj[donor] = {};
					}
					returnObj[donor]['Institute'] = sampleData[i].attributes[j].value;
				} else if (sampleData[i].attributes[j].name === 'Tissue Origin') {
					if (typeof returnObj[donor] === 'undefined') {
						returnObj[donor] = {};
					}
					returnObj[donor]['Tissue Origin'] = sampleData[i].attributes[j].value;
				} else if (sampleData[i].attributes[j].name === 'External Name') {
					if (typeof returnObj[donor] === 'undefined') {
						returnObj[donor] = {};
					}
					returnObj[donor]['External Name'] = sampleData[i].attributes[j].value;
				}
			}
		}
	}

	return returnObj;
}

/**
 * returns project information query-able by keys by updating functions
 * @param {json} projectData
 * @return {object} projectDataInfo
 */
function getProjectDataInfo(projectData) {
	var returnObj = {};

	for (var i = 0; i < projectData.length; i++) {
		returnObj[projectData[i].name] = {};
		returnObj[projectData[i].name]['Start Date'] = projectData[i].earliest;
		returnObj[projectData[i].name]['Last Modified'] = projectData[i].latest;
		//returnObj[projectData[i].name]['Count'] = projectData[i].count;
	}

	return returnObj;
}

// ETC
/**
 * takes in a date object or date string and converts it into %Y-%m-%d %H:%M:%S format
 * @param {Date or string} date
 * @return {string} formattedDate
 */
function getDateTimeString(date) {
	if (typeof date === 'string') {
		date = new Date(date);
	}
	var year    = date.getFullYear();
	var month   = date.getMonth()+1; 
	var day     = date.getDate();
	var hour    = date.getHours();
	var minute  = date.getMinutes();
	var second  = date.getSeconds(); 
	if(month.toString().length == 1) {
		var month = '0' + month;
	}
	if(day.toString().length == 1) {
		var day = '0' + day;
	}   
	if(hour.toString().length == 1) {
		var hour = '0' + hour;
	}
	if(minute.toString().length == 1) {
		var minute = '0' + minute;
	}
	if(second.toString().length == 1) {
		var second = '0' + second;
	}   
	var dateTime = year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second;
	
    return dateTime;
}

/**
 * returns all documents in a collection
 * @param {array} docs
 * @param {string} collection
 * @param {db} db
 * @param {function} callback
 * @return {array} docs
 */
function findAllDocuments(docs, collection, db, callback) {
	var cursor = db.collection(collection).find();
	cursor.each(function(err, doc) {
		if (err) return console.error(err);
		if (doc != null) {
			docs.push(doc._id);
		} else {
			callback();
			return docs;
		}
	});
};

/**
 * returns all report documents information in a collection
 * @param {array} docs
 * @param {db} db
 * @param {function} callback
 * @return {array} docs
 */
function findReportDocuments(docs, db, callback) {
	var cursor1 = db.collection('IUSSWIDReportData').find();
	var cursor2 = db.collection('IUSSWIDRNASeqQCData').find();
	cursor1.each(function(err, doc) {
		if (err) return console.error(err);
		if (doc != null) {
			var obj = {};
			obj._id = doc._id;
			obj.run = doc.data['Run Name'];
			obj.lane = doc.data.Lane;
			obj.yield = doc.data.Yield;
			obj.reads = doc.data.Reads;
			var match = /(\d*.\d*)/.exec(doc.data['% on Target']);
			obj.target = parseInt(match[1]);
			docs.push(obj);
		} else {
			cursor2.each(function(err, doc) {
				if (err) return console.error(err);
				if (doc != null) {
					var obj = {};
					obj._id = doc._id;
					obj.run = doc.data.run_name;
					obj.lane = doc.data.lane;
					obj.yield = parseInt(doc.data.Yield);
					obj.reads = parseInt(doc.data['Total Reads']);
					docs.push(obj);
				} else {
					callback();
					console.log(docs);
					return docs;
				}
			});
		}
	});
}