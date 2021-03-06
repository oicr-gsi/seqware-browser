// Separate scripts require this script for all the functions to update data to mongodb

// Node Modules
var fs = require('fs');
var _ = require('underscore');
var YAML = require('yamljs');
var http = require("http");
var AdmZip = require('adm-zip');
var config = require(process.env.config);
var JSON = require('JSON');

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
/**
 * updates a list of projects and associated info
 * @param {json} projectData
 */
exports.updateProjectInfo = function (projectData) {
	MongoClient.connect(url, function(err, db) {
		var batch = db.collection('ProjectInfo').initializeUnorderedBulkOp();
		db.collection('ProjectInfo').createIndex({"project_name": 1}, {unique: true}, function (err, result) {
			var projectInfo = getProjectDataInfo(projectData);

			// Get all project info
			for (var project in projectInfo) {
				var returnObj = {};
				returnObj['project_name'] = project;
				// Convert date time to same format
				returnObj['start_tstmp'] = getDateTimeString(projectInfo[project]['Start Date']);
				//returnObj['last_mod'] = getDateTimeString(projectInfo[project]['Last Modified']);

				batch.find({project_name: project}).upsert().updateOne(returnObj);
			}
			batch.execute(function(err, result) {
				if (err) console.dir(err);
				db.close();
			});
		});
	});
}

///////////////////////////////// RunInfo ///////////////////////////////
/**
 * updates a list of runs and associated info
 * @param {json} sequencerData 
 */
exports.updateRunInfo = function (sequencerData) {
	MongoClient.connect(url, function(err, db) {
		if (err) return console.error(err);
		var batch = db.collection('RunInfo').initializeUnorderedBulkOp();
		db.collection('RunInfo').createIndex({'run_name': 1}, {unique: true}, function (err, result) {
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
						returnObj['run_name'] = sequencerData[i].name;
						returnObj['start_tstmp'] = getDateTimeString(sequencerData[i].created_date);
						if (typeof sequencerData[i].completion_date !== 'undefined') {
							 returnObj['end_tstmp'] = getDateTimeString(sequencerData[i].completion_date);
						}
						else {
							returnObj['end_tstmp'] = "n/a";
						}
						returnObj['status'] = sequencerData[i].state;

						// Get all Running sequencer runs
						if (sequencerData[i].state === 'Running' && new Date(sequencerData[i].created_date) > new Date('2014-02-01 00:00:00')) {
							running.push(sequencerData[i].name); 
						}
						batch.find({run_name: returnObj['run_name']}).upsert().updateOne(returnObj);
					}

					// Query for running sequencer runs by 
					// sequencerData[i].state === 'Running' && new Date(sequencerData[i].created_date) > new Date('2014-02-01 00:00:00')
					for (var i = 0; i < jsonData.length; i++) {
						complete.push(jsonData[i].sequencer_run_name);
					}

					// Change status to 'Complete' if in psql database (even if status is running in pinery)
					var completed = _.intersection(running, complete);
					for (var i = 0; i < completed.length; i++) {
						batch.find({run_name: completed[i]}).upsert().updateOne({ $set: {status: 'Completed'} });
					}

					batch.execute(function(err, result) {
						if (err) console.dir(err);
						db.close();
					});
					client.end();
				});
			});
		});		
	});
}

///////////////////////////////// DonorInfo ///////////////////////////////
/**
 * updates a list of donors heads and associated info
 * @param {json} sequencerData 
 * @param {json} sampleData
 */
exports.updateDonorInfo = function (sequencerData, sampleData) {
	MongoClient.connect(url, function(err, db) {
		var batch = db.collection('DonorInfo').initializeUnorderedBulkOp();
		db.collection('DonorInfo').createIndex({'donor_name': 1}, null, function (err, results) {
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
					returnObj[donor]['donor_name'] = donor;
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
				batch.find({donor_name: donor}).upsert().updateOne(returnObj[donor]);
			}

			batch.execute(function(err, result) {
				if (err) console.dir(err);
				db.close();
			});
		});
	});
}

/////////////////////////////// LibraryInfo /////////////////////////////////
/** library_name: (run_name||lane||template_id)
 * updates library information mongodb and inserts if it isn't in the collection
 * @param {json} sequencerData 
 * @param {json} sampleData
 * @param {json} skipData (psql query)
 * @param {json} receiveData (psql query)
 */
exports.updateLibraryInfo = function (sequencerData, sampleData, skipData, receiveData) {
	MongoClient.connect(url, function(err, db) {
		var batch = db.collection('LibraryInfo').initializeUnorderedBulkOp();
		db.collection('LibraryInfo').createIndex({'library_seqname': 1}, {unique: true}, function (err, result) {
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
							var unique_id = sequencerData[i].name + '||' + sequencerData[i].positions[j].position + '||' + id; // library id is run_name || lane || template_id
							if (/Library Seq$/.test(sampleIDInfo[id]['Sample Type'])) {
								var libraryName = sampleIDInfo[id]['Library Name'];
								libraries[unique_id] = {};
								libraries[unique_id].library_seqname = unique_id;
								libraries[unique_id].template_id = id;
								libraries[unique_id].library_name = sampleIDInfo[id]['Library Name'];
								libraries[unique_id].project_info_name = sampleIDInfo[id]['Project Name'];
								libraries[unique_id].run_info_name = sequencerData[i].name;
								libraries[unique_id].lane = sequencerData[i].positions[j].position;
								// Determine skip (t/f)
								if (typeof sampleSkipInfo[unique_id] !== 'undefined') {
									libraries[unique_id].skip = sampleSkipInfo[unique_id].skip;
								} else {
									libraries[unique_id].skip = 'n/a';
								}
								// Determine create and prepared dates
								if (typeof sampleDateInfo[id] !== 'undefined') {
									libraries[unique_id].create_tstmp = new Date(sampleDateInfo[id]['create_tstmp']);
									libraries[unique_id].prep_tstmp = new Date(sampleDateInfo[id]['prep_tstmp']);
								} else {
									libraries[unique_id].create_tstmp = 'n/a';
									libraries[unique_id].prep_tstmp = 'n/a';
								}

								// If library format is w/ 6 underscores
								// Determine tissue and library type
								if (/^.*?_.*?_.*?_.*?_.*?_.*?_.*?[^_]$/.test(libraryName)) {
									if (/.*_(.*?)$/.test(libraryName)) {
									var match = /.*_(.*?)$/.exec(libraryName);
									libraries[unique_id].library_type = match[1];
									}
									if (/.*?_.*?_.*?_(.*?)_/.test(libraryName)) {
										var match = /.*?_.*?_.*?_(.*?)_/.exec(libraryName);
										libraries[unique_id].tissue_type = match[1];
									}
								}
								// Donor
								// Assume all samples come from the donor (first two sections of library name)
								if (/((.*?)_.*?)_/.test(libraryName)) {
									var match = /((.*?)_.*?)_/.exec(libraryName);
									var donor = match[1];
									var libHead = match[2]; // can sum up totals of donor heads (for runs and donors)
									libraries[unique_id].donor_info_name = donor;
									libraries[unique_id].library_head = libHead; 
									if (typeof sampleIDInfo[donor] !== 'undefined') {
										if (typeof sampleIDInfo[donor]['Tissue Origin'] !== 'undefined') {
											libraries[unique_id].tissue_origin = sampleIDInfo[donor]['Tissue Origin'];
										} else {
											libraries[unique_id].tissue_origin = 'n/a';
										}
									}
									if (typeof sampleReceiveInfo[donor] !== 'undefined') {
										libraries[unique_id].receive_tstmp = new Date(sampleReceiveInfo[donor]);
									} else {
										libraries[unique_id].receive_tstmp = 'n/a';
									}
								}
								if (typeof sequencerData[i].positions[j].samples[k].barcode !== 'undefined') {
									libraries[unique_id].barcode = sequencerData[i].positions[j].samples[k].barcode;
								} else {
									libraries[unique_id].barcode = 'noIndex';
								}
							}
						}
					}
				} else if (typeof sequencerData[i].positions !== 'undefined') {
					var id = sequencerData[i].positions.id;
					var unique_id = sequencerData[i].name + '||' + sequencerData[i].positions[j].position + '||' + id;
					if (/Library Seq$/.test(sampleIDInfo[id]['Sample Type'])) {
						var libraryName = sampleIDInfo[id]['Library Name'];
						libraries[unique_id] = {};
						libraries[unique_id].library_seqname = unique_id;
						libraries[unique_id].template_id = id;
						libraries[unique_id].library_name = libraryName;
						libraries[unique_id].project_info_name = sampleIDInfo[id]['Project Name'];
						libraries[unique_id].run_info_name = sequencerData[i].name;
						libraries[unique_id].lane = sequencerData[i].positions.position;
						// Determine skip (t/f)
						if (typeof sampleSkipInfo[unique_id] !== 'undefined') {
							libraries[unique_id].skip = sampleSkipInfo[unique_id].skip;
						} else {
							libraries[unique_id].skip = 'n/a';
						}
						// Determine create and prepared dates
						if (typeof sampleDateInfo[id] !== 'undefined') {
							libraries[unique_id].create_tstmp = new Date(sampleDateInfo[id]['create_tstmp']);
							libraries[unique_id].prep_tstmp = new Date(sampleDateInfo[id]['prep_tstmp']);
						} else {
							libraries[unique_id].create_tstmp = 'n/a';
							libraries[unique_id].prep_tstmp = 'n/a';
						}

						// If library format is w/ 6 underscores
						// Determine tissue and library type
						if (/^.*?_.*?_.*?_.*?_.*?_.*?_.*?[^_]$/.test(libraryName)) {
							if (/.*_(.*?)$/.test(libraryName)) {
							var match = /.*_(.*?)$/.exec(libraryName);
							libraries[unique_id].library_type = match[1];
							}
							if (/.*?_.*?_.*?_(.*?)_/.test(libraryName)) {
								var match = /.*?_.*?_.*?_(.*?)_/.exec(libraryName);
								libraries[unique_id].tissue_type = match[1];
							}
						}
						// Assume all samples come from the same donor
						if (/((.*?)_.*?)_/.test(libraryName)) {
							var match = /((.*?)_.*?)_/.exec(libraryName);
							var donor = match[1];
							var libHead = match[2]; // can sum up totals of donor heads (for runs and donors)
							libraries[unique_id].donor_info_name = donor;
							libraries[unique_id].library_head = libHead;
							if (typeof sampleIDInfo[donor] !== 'undefined') {
								if (typeof sampleIDInfo[donor]['Tissue Origin'] !== 'undefined') {
									libraries[unique_id].tissue_origin = sampleIDInfo[donor]['Tissue Origin'];
								} else {
									libraries[unique_id].tissue_origin = 'n/a';
								}
							}
							if (typeof sampleReceiveInfo[donor] !== 'undefined') {
								libraries[unique_id].receive_tstmp = new Date(sampleReceiveInfo[donor]);
							} else {
								libraries[unique_id].receive_tstmp = 'n/a';
							}
						}

						if (typeof sequencerData[i].positions.barcode !== 'undefined') {
							libraries[unique_id].barcode = sequencerData[i].positions.barcode;
						} else {
							libraries[unique_id].barcode = 'noIndex';
						}
					}
				}
			}
			for (var unique_id in libraries) {
				batch.find({library_seqname: unique_id}).upsert().updateOne({$set: libraries[unique_id]});
			}
			batch.execute(function(err, result) {
				if (err) console.dir(err);
				db.close();
			});
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

			if (/\/(\d*)$/.test(sampleData[i].parents[0].url)) {
				var match = /\/(\d*)$/.exec(sampleData[i].parents[0].url);
				IUSsampleObj[id]['Parent ID'] = match[1];
			}
		} else { // Not a library seq (parents) everything else
			parentObj[id] = {};
			parentObj[id]['Parent Library Name'] = sampleData[i].name;
			parentObj[id]['Create Date'] = getDateTimeString(sampleData[i].created_date);
			parentObj[id]['Sample Type'] = sampleData[i].sample_type;
			if (typeof sampleData[i].parents !== 'undefined') {
				// get the parent id
				if (/\/(\d*)$/.test(sampleData[i].parents[0].url)) {
					var match = /\/(\d*)$/.exec(sampleData[i].parents[0].url);
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
			returnObj[id]['create_tstmp'] = IUSsampleObj[parentID]['Create Date'];
			parentID = IUSsampleObj[parentID]['Parent ID'];
		} else {
			returnObj[id]['create_tstmp'] = parentObj[parentID]['Create Date'];
		}

		// Determine Prep date by climbing up sample hierarchy
		if (parentObj[parentID]['Parent ID'] === 'Identity') { // if parent is donor
			returnObj[id]['prep_tstmp'] = parentObj[parentID]['Create Date'];
		} else {
			// Keep iterating through hierarchy until the sample type does not end with 'Library'
			while (/Library$/.test(parentObj[parentID]['Sample Type']) && parentObj[parentID]['Parent ID'] !== 'Identity') {
				parentID = parentObj[parentID]['Parent ID'];
			}
			returnObj[id]['prep_tstmp'] = parentObj[parentID]['Create Date'];
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
/** 
 * updates data from seqware database and updates mongodb Library, Run, Date, and Workflow collections
 * @param {yaml} analysisYAML
 */
exports.updateWorkflowInfo = function (analysisYAML) {
	MongoClient.connect(url, function(err, db) {
		var libBatch = db.collection('LibraryInfo').initializeUnorderedBulkOp();
		var wfBatch = db.collection('WorkflowInfo').initializeUnorderedBulkOp();
		db.collection('WorkflowInfo').createIndex({'sw_accession': 1}, {unique: true}, function (err, result) {
			var libraryObj = {};

			// Connect with postgresql
			client.connect(function(err) {
				if (err) return console.error(err);
				// query for all workflow runs
				var query = 'WITH RECURSIVE workflow_run_set AS ( SELECT workflow_run_id from workflow_run),workflow_run_processings (workflow_run_id, processing_id) AS ( SELECT wr.workflow_run_id, p.processing_id from workflow_run wr JOIN workflow_run_set wrs ON wr.workflow_run_id = wrs.workflow_run_id JOIN processing p ON (wr.workflow_run_id = p.workflow_run_id or wr.workflow_run_id = p.ancestor_workflow_run_id) UNION SELECT p.workflow_run_id, pr.parent_id FROM workflow_run_processings p JOIN processing_relationship pr ON p.processing_id = pr.child_id), total_workflow_run_ius AS (SELECT wr.workflow_run_id, i.ius_id FROM workflow_run wr  JOIN workflow_run_set wrs ON wr.workflow_run_id = wrs.workflow_run_id JOIN ius_workflow_runs iwr ON wr.workflow_run_id = iwr.workflow_run_id  JOIN ius i ON iwr.ius_id = i.ius_id UNION SELECT wrp.workflow_run_id, i.ius_id FROM workflow_run_processings wrp JOIN processing_ius pi ON wrp.processing_id = pi.processing_id JOIN ius i ON pi.ius_id = i.ius_id),workflow_run_template_ids AS (SELECT twri.workflow_run_id, array_agg(sa.value) as template_id, array_agg(sr.name || \'||\' || l.lane_index+1 || \'||\' || sa.value || \'||\' || i.sw_accession) as libraryinfo_seqname FROM total_workflow_run_ius twri JOIN ius i ON twri.ius_id = i.ius_id JOIN lane AS l ON i.lane_id = l.lane_id JOIN sequencer_run AS sr ON l.sequencer_run_id = sr.sequencer_run_id JOIN sample s ON i.sample_id = s.sample_id JOIN sample_attribute sa ON s.sample_id = sa.sample_id WHERE sa.tag = \'geo_template_id\' GROUP BY twri.workflow_run_id ) SELECT wr.sw_accession,wr.workflow_run_id,wr.status,wr.status_cmd,wr.create_tstmp as start_tstmp,COALESCE(p.last_modified, wr.create_tstmp) as end_tstmp,w.name || \'_\' || w.version as workflow_name, wrti.template_id, wrti.libraryinfo_seqname FROM workflow_run_set wrs JOIN workflow_run wr ON wrs.workflow_run_id = wr.workflow_run_id JOIN workflow_run_template_ids wrti ON wrs.workflow_run_id = wrti.workflow_run_id  JOIN workflow AS w ON wr.workflow_id = w.workflow_id LEFT OUTER JOIN (SELECT workflow_run_id, MAX(update_tstmp) AS last_modified FROM processing GROUP BY workflow_run_id ) AS p ON p.workflow_run_id = wr.workflow_run_id;';

				client.query(query, function (err, result) {
					if (err) console.error(err);
					var jsonData = result.rows;

					for (var i = 0; i < jsonData.length; i++) {
						jsonData[i].sw_accession = jsonData[i].sw_accession;
						// Update WorkflowInfo
						var WorkflowInfo_accession = jsonData[i].sw_accession;
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
						jsonData[i].start_tstmp = getDateTimeString(jsonData[i].start_tstmp);
						jsonData[i].end_tstmp = getDateTimeString(jsonData[i].end_tstmp);

						for (var j = 0; j < jsonData[i].libraryinfo_seqname.length; j++) {
							// Parse out ids from libraryinfo_seqname
							var match = /(.*?\|\|.*?\|\|.*?)\|\|(.*?)$/.exec(jsonData[i].libraryinfo_seqname[j]);
							var librarySeq_id = match[1];
							var iusswid = match[2];

							// Update workflow info library ids to library seq ids
							jsonData[i].libraryinfo_seqname[j] = librarySeq_id;

							// Update workflows for each library id
							if (typeof libraryObj[librarySeq_id] === 'undefined') {
								libraryObj[librarySeq_id] = {};
								libraryObj[librarySeq_id]['workflowinfo_accession'] = [];
								if (isNaN(parseInt(iusswid))) { //only parseInt if there are no letters in id
									libraryObj[librarySeq_id]['iusswid'] = (iusswid);
								}
								else {
									libraryObj[librarySeq_id]['iusswid'] = parseInt(iusswid); //only for libraries with workflows
								}							 
							}
							libraryObj[librarySeq_id]['workflowinfo_accession'].push(WorkflowInfo_accession);
						}

						// Update workflow information batch
						// Do not update with library_ids, omit
						jsonData[i] = _.omit(jsonData[i], ['libraryinfo_seqname', 'template_id']);
						wfBatch.find({'sw_accession':jsonData[i].sw_accession}).upsert().updateOne(jsonData[i]);
					}

					// Sets the workflow arrays and iusswid in LibraryInfo collection
					for (var librarySeq_id in libraryObj) {
						var setMod = { $set:{} };
						setMod.$set = libraryObj[librarySeq_id];
						libBatch.find({library_seqname: librarySeq_id}).upsert().updateOne(setMod);
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
	});
}

///////////////////////////////// FilesInfo ////////////////////////////////////
/** fileSWID
 * updates mongodb list of files and links to associated WorkflowInfo_accessions
 * @param {file-json} fprData
 */
exports.updateFileInfo = function (fprData) {
	MongoClient.connect(url, function (err, db) {
		var batch = db.collection('FileInfo').initializeUnorderedBulkOp();
		db.collection('FileInfo').createIndex({'file_swid': 1}, {unique: true}, function (err, result) {

			// search file provenance report for file data
			for (var fileSWID in fprData['File']) {
				var obj = {};
				if (isNaN(parseInt(fileSWID))) {
					obj['file_swid'] = fileSWID;
				}
				else {
					obj['file_swid'] = parseInt(fileSWID);
				}
				obj['file_path'] = fprData['File'][fileSWID]['Path'];
				if (isNaN(parseInt(fprData['File'][fileSWID]['WorkflowSWID']))) {
					obj['workflow_info_accession'] = fprData['File'][fileSWID]['WorkflowSWID'];
				}
				else {
					obj['workflow_info_accession'] = parseInt(fprData['File'][fileSWID]['WorkflowSWID']);
				}

				batch.find({file_swid: fileSWID}).upsert().updateOne(obj);
			}
			batch.execute(function(err, result) {
				if (err) console.dir(err);
				db.close();
			});
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
		var wfBatch = db.collection('WorkflowInfo').initializeUnorderedBulkOp();
		var docs = [];
		findWorkflowDocuments(docs, 'WorkflowInfo', 'running', 'pending', 'submitted', db, function() {
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
				var query = 'WITH RECURSIVE workflow_run_set AS (SELECT workflow_run_id from workflow_run where ' + ids + ' status = \'running\'), workflow_run_processings (workflow_run_id, processing_id) AS (SELECT wr.workflow_run_id, p.processing_id from workflow_run wr JOIN workflow_run_set wrs ON wr.workflow_run_id = wrs.workflow_run_id JOIN processing p ON (wr.workflow_run_id = p.workflow_run_id or wr.workflow_run_id = p.ancestor_workflow_run_id) UNION SELECT p.workflow_run_id, pr.parent_id FROM workflow_run_processings p JOIN processing_relationship pr ON p.processing_id = pr.child_id), total_workflow_run_ius AS (SELECT wr.workflow_run_id, i.ius_id FROM workflow_run wr  JOIN workflow_run_set wrs ON wr.workflow_run_id = wrs.workflow_run_id JOIN ius_workflow_runs iwr ON wr.workflow_run_id = iwr.workflow_run_id  JOIN ius i ON iwr.ius_id = i.ius_id UNION SELECT wrp.workflow_run_id, i.ius_id FROM workflow_run_processings wrp JOIN processing_ius pi ON wrp.processing_id = pi.processing_id JOIN ius i ON pi.ius_id = i.ius_id),workflow_run_template_ids AS (SELECT twri.workflow_run_id, array_agg(sa.value) as template_id, array_agg(sr.name || \'||\' || l.lane_index+1 || \'||\' || sa.value || \'||\' || i.sw_accession) as libraryinfo_seqname FROM total_workflow_run_ius twri JOIN ius i ON twri.ius_id = i.ius_id JOIN lane AS l ON i.lane_id = l.lane_id JOIN sequencer_run AS sr ON l.sequencer_run_id = sr.sequencer_run_id JOIN sample s ON i.sample_id = s.sample_id JOIN sample_attribute sa ON s.sample_id = sa.sample_id WHERE sa.tag = \'geo_template_id\' GROUP BY twri.workflow_run_id ) SELECT wr.sw_accession,wr.workflow_run_id,wr.status,wr.status_cmd,wr.create_tstmp as start_tstmp,COALESCE(p.last_modified, wr.create_tstmp) as end_tstmp,w.name || \'_\' || w.version as workflow_name, wrti.template_id, wrti.libraryinfo_seqname FROM workflow_run_set wrs JOIN workflow_run wr ON wrs.workflow_run_id = wr.workflow_run_id JOIN workflow_run_template_ids wrti ON wrs.workflow_run_id = wrti.workflow_run_id  JOIN workflow AS w ON wr.workflow_id = w.workflow_id LEFT OUTER JOIN (SELECT workflow_run_id, MAX(update_tstmp) AS last_modified FROM processing GROUP BY workflow_run_id ) AS p ON p.workflow_run_id = wr.workflow_run_id;';
				//console.log(query);
				client.query(query, function (err, result) {
					if (err) console.error(err);

					for (var i = 0; i < result.rows.length; i++) {
						result.rows[i].sw_accession = String(result.rows[i].sw_accession);
						// Update workflow info
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
						
						result.rows[i].start_tstmp = getDateTimeString(result.rows[i].start_tstmp);
						result.rows[i].end_tstmp = getDateTimeString(result.rows[i].end_tstmp);

						// Do not update with library_ids, omit
						result.rows[i] = _.omit(result.rows[i], ['libraryinfo_seqname', 'template_id']);

						// Update workflow in collection, regardless if it is running, failed or completed
						wfBatch.find({sw_accession: result.rows[i].sw_accession}).upsert().updateOne(result.rows[i]);
					}

					if (result.rows.length!==0){
						wfBatch.execute(function(err, result) {
							if (err) console.dir(err);
							db.close();
						});
					}
					else {
						db.close();
					}
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
		var wfBatch = db.collection('WorkflowInfo').initializeUnorderedBulkOp();

		var docs = [];
		findWorkflowDocuments(docs, 'FailedWorkflowRuns', 'failed', '', '', db, function() {
			if (typeof docs !== 'undefined') {

				// Connect to postgresql client
				client.connect(function(err) {
					if (err) return console.error(err);
					var query = 'WITH RECURSIVE workflow_run_set AS (SELECT workflow_run_id from workflow_run where sw_accession in ( ' + docs.join() + ' ) ), workflow_run_processings (workflow_run_id, processing_id) AS (SELECT wr.workflow_run_id, p.processing_id from workflow_run wr JOIN workflow_run_set wrs ON wr.workflow_run_id = wrs.workflow_run_id JOIN processing p ON (wr.workflow_run_id = p.workflow_run_id or wr.workflow_run_id = p.ancestor_workflow_run_id) UNION SELECT p.workflow_run_id, pr.parent_id FROM workflow_run_processings p JOIN processing_relationship pr ON p.processing_id = pr.child_id), total_workflow_run_ius AS (SELECT wr.workflow_run_id, i.ius_id FROM workflow_run wr  JOIN workflow_run_set wrs ON wr.workflow_run_id = wrs.workflow_run_id JOIN ius_workflow_runs iwr ON wr.workflow_run_id = iwr.workflow_run_id  JOIN ius i ON iwr.ius_id = i.ius_id UNION SELECT wrp.workflow_run_id, i.ius_id FROM workflow_run_processings wrp JOIN processing_ius pi ON wrp.processing_id = pi.processing_id JOIN ius i ON pi.ius_id = i.ius_id),workflow_run_template_ids AS (SELECT twri.workflow_run_id, array_agg(sa.value) as template_id, array_agg(sr.name || \'||\' || l.lane_index+1 || \'||\' || sa.value || \'||\' || i.sw_accession) as libraryinfo_seqname FROM total_workflow_run_ius twri JOIN ius i ON twri.ius_id = i.ius_id JOIN lane AS l ON i.lane_id = l.lane_id JOIN sequencer_run AS sr ON l.sequencer_run_id = sr.sequencer_run_id JOIN sample s ON i.sample_id = s.sample_id JOIN sample_attribute sa ON s.sample_id = sa.sample_id WHERE sa.tag = \'geo_template_id\' GROUP BY twri.workflow_run_id ) SELECT wr.sw_accession,wr.workflow_run_id,wr.status,wr.status_cmd,wr.create_tstmp as start_tstmp,COALESCE(p.last_modified, wr.create_tstmp) as end_tstmp,w.name || \'_\' || w.version as workflow_name, wrti.template_id, wrti.libraryinfo_seqname FROM workflow_run_set wrs JOIN workflow_run wr ON wrs.workflow_run_id = wr.workflow_run_id JOIN workflow_run_template_ids wrti ON wrs.workflow_run_id = wrti.workflow_run_id  JOIN workflow AS w ON wr.workflow_id = w.workflow_id LEFT OUTER JOIN (SELECT workflow_run_id, MAX(update_tstmp) AS last_modified FROM processing GROUP BY workflow_run_id ) AS p ON p.workflow_run_id = wr.workflow_run_id;';
					
					client.query(query, function (err, result) {
						if (err) console.error(err);

						for (var i = 0; i < result.rows.length; i++) {
							if (result.rows[i].status !== 'failed') {
								result.rows[i].sw_accession = String(result.rows[i].sw_accession);
								// Update workflow info
								var WorkflowInfo_accession = parseInt(result.rows[i].sw_accession);
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
								result.rows[i].start_tstmp = getDateTimeString(result.rows[i].start_tstmp);
								result.rows[i].end_tstmp = getDateTimeString(result.rows[i].end_tstmp);

								// Do not update with library_ids, omit
								result.rows[i] = _.omit(result.rows[i], ['libraryinfo_seqname', 'template_id']);

								wfBatch.find({sw_accession: result.rows[i].sw_accession}).upsert().updateOne(result.rows[i]);
							}
						}

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

/** IUSSWID
 * returns graph data
 * @param {json} fprData
 */

exports.updateGraphData = function (fprData) {
	// Charts generated using Google charts
	MongoClient.connect(url, function (err, db) {
		if (err) console.error(err);
		var batch = db.collection('IUSSWIDGraphData').initializeUnorderedBulkOp();
		db.collection('IUSSWIDGraphData').createIndex({'iusswid': 1}, {unique: true}, function (err, result) {
			var ids = [];
			findReportDocumentsIUSSWID(ids, 'IUSSWIDGraphData', db, function (err) {
				var newIUSSWID = _.difference(Object.keys(fprData['Library']), ids);
				//console.log(newIUSSWID);
				for (var ius = 0; ius < newIUSSWID.length; ius++) {
					//console.log(fprData['Library'][newIUSSWID[ius]]);
					if (typeof fprData['Library'][newIUSSWID[ius]]['JSON'] !== 'undefined') {
						// Get graph data from JSON file
						jsonExists = fs.existsSync(fprData['Library'][newIUSSWID[ius]]['JSON']);
						if (jsonExists) {
							var jsonString = fs.readFileSync(fprData['Library'][newIUSSWID[ius]]['JSON'], 'utf8');
							var lineObj = JSON.parse(jsonString);

							if (typeof lineObj['barcode'] === 'undefined'){
								lineObj['barcode'] = 'NoIndex';
							}
							var title = lineObj['run name'] + ' Lane: ' + lineObj['lane'] + ' Barcode: ' + lineObj['barcode'] + ' Library: ' + lineObj['library'];
							var graphData = {};
							if (isNaN(parseInt(newIUSSWID[ius]))) {
								graphData['iusswid'] = newIUSSWID[ius];
							}
							else {
								graphData['iusswid'] = parseInt(newIUSSWID[ius]);
							}
							graphData['read_breakdown'] = {};
							graphData['insert_distribution'] = {};
							graphData['soft_clip_by_cycle'] = {};
							graphData['title'] = title;

							// pie chart - read breakdown
							// initialize variables
							var pieArray = ['Number'];
							var colors = ['#878BB6', '#4ACAB4', '#FF8153', '#FFEA88'];
							var labels = ['Reads', 'on target', 'off target', 'repeat/low quality', 'unmapped'];
							pieArray.push(parseInt(lineObj['mapped reads']));
							pieArray.push(parseInt(lineObj['mapped reads']) - parseInt(lineObj['reads on target']));
							pieArray.push(parseInt(lineObj['qual fail reads']));
							pieArray.push(parseInt(lineObj['unmapped reads']));

							graphData['read_breakdown']['colors'] = colors;
							graphData['read_breakdown']['labels'] = labels;
							graphData['read_breakdown']['data'] = pieArray;
							
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

						    graphData['insert_distribution']['x_values'] = xValInsert;
							graphData['insert_distribution']['y_values'] = yValInsert;
							graphData['insert_distribution']['colors'] = insertColors;

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

							graphData['soft_clip_by_cycle']['x_values'] = xValSoft;
							graphData['soft_clip_by_cycle']['y_values'] = yValSoft;

							//console.log(graphData);
							// Update in mongodb
							batch.find({iusswid: newIUSSWID[ius]}).upsert().updateOne(graphData);
						} else {
							console.log(fprData['Library'][newIUSSWID[ius]]['JSON'] + " does not exist")
						}
					}
				}
				if (batch.s.currentBatch !== null) {
					batch.execute(function(err, result) {
						if (err) console.dir(err);
						db.close();
					});
				} else {
					db.close();
				}
			});
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

		db.collection('IUSSWIDGraphData').findOne({iusswid: id}, function (err, item){
			pieValues = _.zip(item['read_breakdown']['labels'], item['read_breakdown']['data']);
			pieOptions = {
				title: item['title'] + ' read_breakdown', 
				width: 600, height: 400, 
				colors: item['read_breakdown']['colors']
			};
			insertLineValues = _.zip(item['insert_distribution']['x_values'], item['insert_distribution']['y_values'], item['insert_distribution']['colors']);
 			insertLineOptions = {
				title: item['title'] + ' insert_distribution',
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
			softLineValues = _.zip(item['soft_clip_by_cycle']['x_values'], item['soft_clip_by_cycle']['y_values']);
 			softLineOptions = {
				title: item['title'] + ' soft_clip_by_cycle', 
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
		//returnObj[projectData[i].name]['Last Modified'] = projectData[i].latest;
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
	var dateType = new Date(dateTime);

    return dateType;
}

/**
 * returns all documents in a collection
 * @param {array} docs
 * @param {string} collection
 * @param {db} db
 * @param {function} callback
 * @return {array} docs
 */
function findWorkflowDocuments(docs, collection, restrictionOne, restrictionTwo, restrictionThree, db, callback) {
	var cursor = db.collection(collection).find({status: restrictionOne, status: restrictionTwo, status: restrictionThree});
	cursor.each(function(err, doc) {
		if (err) return console.error(err);
		if (doc != null) {
			docs.push(doc.sw_accession);
		} else {
			callback();
			return docs;
		}
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