// Send get requests to this script to obtain file provenance report data in JSON format

var fs = require('fs');
var _ = require('underscore');
var YAML = require('yamljs');
var readMultipleFiles = require('read-multiple-files');
var http = require("http");
var AdmZip = require('adm-zip');
var config = require('./config.js');

var	mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://' + config.mongo.host + '/' + config.mongo.database;

var pg = require('pg');
var cp = config.postgres;
var client = new pg.Client('postgres://' + cp.username + ':' + cp.password + '@' + cp.host + ':' + cp.port + '/' + cp.database);

var dateNow = new Date();
var analysisYAML;

/////////////////////////////// Functions ///////////////////////////////

///////////////////////////////// ProjectInfo /////////////////////////////
// returns a list of projects and associated info
// _id: project name
exports.updateProjectInfo = function (sequencerData, sampleData, projectData) {
	MongoClient.connect(url, function(err, db) {
		var batch = db.collection('ProjectInfo').initializeUnorderedBulkOp();
		var sampleIDInfo = getSampleIDInfo(sampleData);
		var projectInfo = getProjectDataInfo(projectData);
		var returnObj = {};

		// Get all project info
		for (var project in projectInfo) {
			returnObj[project] = {};
			returnObj[project]['_id'] = project;
			returnObj[project]['start_date'] = getDateTimeString(projectInfo[project]['Start Date']);
			returnObj[project]['last_mod'] = getDateTimeString(projectInfo[project]['Last Modified']);
		}

		// NOTE: Donors are all samples with sample_type: Identity or the first two fields in library name
		// Get all donor info
		for (var id in sampleIDInfo) {
			var project = sampleIDInfo[id]['Project Name'];
			var libraryName = sampleIDInfo[id]['Library Name'];
			var donor;
			if (typeof returnObj[project] !== 'undefined') {
				if (typeof returnObj[project]['DonorInfo_id'] === 'undefined') {
					returnObj[project]['DonorInfo_id'] = [];
				}
				// Get all samples with sample_type: Identity
				if (sampleIDInfo[id]['Sample Type'] === 'Identity') {
					if (/(.*?_.*?)_/.test(libraryName)) {
						var match = /(.*?_.*?)_/.exec(libraryName);
						donor = match[1];
					} else {
						donor = libraryName;
					}
				// Get all library heads
				} else if (/(.*?_.*?)_/.test(libraryName)) {
					var match = /(.*?_.*?)_/.exec(libraryName);
					donor = match[1];
				}
				returnObj[project]['DonorInfo_id'].push(donor);
			}
		}

		// Get all library seq info
		for (var i = 0; i < sequencerData.length; i++) {
			// Pooled Sample
			if (Object.prototype.toString.call(sequencerData[i].positions) === '[object Array]') {
				for (var j = 0; j < sequencerData[i].positions.length; j++) {
					for (var k = 0; k < sequencerData[i].positions[j].samples.length; k++) {
						var id = sequencerData[i].positions[j].samples[k].id;
						if (/Library Seq$/.test(sampleIDInfo[id]['Sample Type'])) {
							var projectName = sampleIDInfo[id]['Project Name'];
							if (typeof returnObj[projectName]['LibraryInfo_id'] === 'undefined') {
								returnObj[projectName]['LibraryInfo_id'] = [];
								//returnObj[projectName]['library_names'] = [];
								returnObj[projectName]['RunInfo_id'] = [];
							}
							returnObj[projectName]['LibraryInfo_id'].push(sequencerData[i].name + '||' + sequencerData[i].positions[j].position + '||' + id); // uniq template (library seq)
							returnObj[projectName]['RunInfo_id'].push(sequencerData[i].name);
							//returnObj[projectName]['library_names'].push(sampleIDInfo[id]['Library Name']);
						}
					}
				}

			// Single Sample
			} else if (typeof sequencerData[i].positions !== 'undefined') {
				var id = sequencerData[i].positions.id;
				var projectName = sampleIDInfo[id]['Library Name'];
				if (typeof returnObj[projectName] === 'undefined') {
					returnObj[projectName]['LibraryInfo_id'] = [];
					//returnObj[projectName]['library_names'] = [];
					returnObj[projectName]['RunInfo_id'] = [];
				}
				returnObj[projectName]['LibraryInfo_id'].push(sequencerData[i].name + '||' + sequencerData[i].positions[j].position + '||' + id); // uniq template (library seq)
				returnObj[projectName]['RunInfo_id'].push(sequencerData[i].name);
				//returnObj[projectName]['library_names'].push(sampleIDInfo[id]['Library Name']);

				// no samples (some failed runs)
			} else {
				//console.log(sequencerData[i]);
			}
		}

		// Get library, run, donor totals and remove duplicates
		for (var project in returnObj) {
			if (typeof returnObj[project]['RunInfo_id'] !== 'undefined') {
				returnObj[project]['RunInfo_id'] = _.uniq(returnObj[project]['RunInfo_id']);
				returnObj[project]['num_runs'] = returnObj[project]['RunInfo_id'].length;
			} else {
				returnObj[project]['num_runs'] = 0;
			}
			if (typeof returnObj[project]['LibraryInfo_id'] !== 'undefined') {
				//returnObj[project]['LibraryInfo_id'] = _.uniq(returnObj[project]['LibraryInfo_id']);
				//returnObj[project]['library_names'] = _.uniq(returnObj[project]['library_names']);
				returnObj[project]['num_libraries'] = returnObj[project]['LibraryInfo_id'].length;
			} else {
				returnObj[project]['num_libraries'] = 0;
			}
			if (typeof returnObj[project]['DonorInfo_id'] !== 'undefined') {
				returnObj[project]['donor_totals'] = {};
				returnObj[project]['DonorInfo_id'] = _.uniq(returnObj[project]['DonorInfo_id']);
				returnObj[project]['num_donors'] = returnObj[project]['DonorInfo_id'].length;
			} else { 
				returnObj[project]['num_donors'] = 0;
			}
			for (var j = 0; j < returnObj[project]['DonorInfo_id'].length; j++) {
				var donor = returnObj[project]['DonorInfo_id'][j];
				if(/(.*?)_/.test(donor)) {
					var match = /(.*?)_/.exec(donor);
					var donorHead = match[1];
					if (typeof returnObj[project]['donor_totals'][donorHead] === 'undefined') {
						returnObj[project]['donor_totals'][donorHead] = 1;
					} else {
						returnObj[project]['donor_totals'][donorHead]++;
					}
				}
			}
			batch.find({_id: project}).upsert().updateOne(returnObj[project]);
		}
		batch.execute(function(err, result) {
			if (err) console.dir(err);
			db.close();
		});
	});
}

///////////////////////////////// RunInfo /////////////////////////////////////////
// returns a list of runs and associated info
// _id: run name
exports.updateRunInfo = function (sequencerData, sampleData) {
	MongoClient.connect(url, function(err, db) {
		var batch = db.collection('RunInfo').initializeUnorderedBulkOp();
		var sampleIDInfo = getSampleIDInfo(sampleData);
		db.collection('LibraryInfo').createIndex({"skip": 1}, null, function (err) {
			if (err) return console.error(err);
			var docs = [];
			findDocuments(docs, {"skip": 1}, 'LibraryInfo', 'RunInfo_id', db, function() {
				var skipData = {};
				for (i = 0; i < docs.length; i++) {
					if (typeof skipData[docs[i]] === 'undefined') {
						skipData[docs[i]] = 0;
					}
					skipData[docs[i]]++;
				}
				console.log(skipData);
				for (var i = 0; i < sequencerData.length; i++) {
					var returnObj = {};
					returnObj['_id'] = sequencerData[i].name;
					returnObj['start_date'] = getDateTimeString(sequencerData[i].created_date);
					returnObj['status'] = sequencerData[i].state;
					returnObj['LibraryInfo_id'] = [];
					if (typeof skipData[sequencerData[i].name] !== 'undefined') {
						returnObj['skipped_libraries'] = skipData[sequencerData[i].name];
					} 
					// Pooled Sample
					if (Object.prototype.toString.call(sequencerData[i].positions) === '[object Array]') {
						returnObj['library_types'] = {};
						returnObj['tissue_types'] = {};
						returnObj['library_totals'] = {};
						returnObj['donors'] = {};
						returnObj['donor_totals'] = {};
						returnObj['libraries'] = []
						returnObj['projects'] = {};
						for (var j = 0; j < sequencerData[i].positions.length; j++) {
							for (var k = 0; k < sequencerData[i].positions[j].samples.length; k++) {
								var id = sequencerData[i].positions[j].samples[k].id;
								if (/Library Seq$/.test(sampleIDInfo[id]['Sample Type'])) {
									var libraryName = sampleIDInfo[id]['Library Name'];
									if (/.*_(.*?)$/.test(libraryName)) {
										var match = /.*_(.*?)$/.exec(libraryName);
										if (typeof returnObj['library_types'][match[1]] === 'undefined'){
											returnObj['library_types'][match[1]] = 1;
										} else {
											returnObj['library_types'][match[1]]++;
										}
									}
									if (/.*?_.*?_.*?_(.*?)_/.test(libraryName)) {
										var match = /.*?_.*?_.*?_(.*?)_/.exec(libraryName);
										if (typeof returnObj['tissue_types'][match[1]] === 'undefined') {
											returnObj['tissue_types'][match[1]] = 1;						
										} else {
											returnObj['tissue_types'][match[1]]++;
										}
									}
									if (/(.*?)_/.test(libraryName)) {
										var match = /(.*?)_/.exec(libraryName);
										if (typeof returnObj['library_totals'][match[1]] === 'undefined') {
											returnObj['library_totals'][match[1]] = 1;
										} else {
											returnObj['library_totals'][match[1]]++;
										}
									}
									// Determine donors
									var donor;
									if (sampleIDInfo[id]['Sample Type'] === 'Identity') {
										if (/(.*?_.*?)_/.test(libraryName)) {
											var match = /(.*?_.*?)_/.exec(libraryName);
											donor = match[1];
										} else {
											donor = libraryName;
										}
									} else if (/(.*?_.*?)_/.test(libraryName)) {
										var match = /(.*?_.*?)_/.exec(libraryName);
										donor = match[1];
									}
									if (typeof donor !== 'undefined') {
										if (typeof returnObj['donors'][donor] === 'undefined') {
											returnObj['donors'][donor] = 1;
										} else {
											returnObj['donors'][donor]++;
										}	
									}

									//Determine projects
									var project = sampleIDInfo[id]['Project Name'];
									if (typeof returnObj['projects'][project] === 'undefined') {
										returnObj['projects'][project] = 1;
									} else {
										returnObj['projects'][project]++;
									}
									returnObj['LibraryInfo_id'].push(sequencerData[i].name + '||' + sequencerData[i].positions[j].position + '||' + id);
									returnObj['libraries'].push(libraryName);
								}
							}
						}
					// Single Sample
					} else if (typeof sequencerData[i].positions !== 'undefined') {
						returnObj['library_types'] = {};
						returnObj['tissue_types'] = {};
						returnObj['library_totals'] = {};
						returnObj['donors'] = {};
						returnObj['donor_totals'] = {};
						returnObj['libraries'] = [];
						returnObj['projects'] = {};
						var id = sequencerData[i].positions.id;
						if (/Library Seq$/.test(sampleIDInfo[id]['Sample Type'])) {
							var libraryName = sampleIDInfo[id]['Library Name'];
							if (/.*_(.*?)$/.test(libraryName)) {
								var match = /.*_(.*?)$/.exec(libraryName);
								if (typeof returnObj['library_types'][match[1]] === 'undefined'){
									returnObj['library_types'][match[1]] = 1;
								} else {
									returnObj['library_types'][match[1]]++;
								}
							}
							if (/.*?_.*?_.*?_(.*?)_/.test(libraryName)) {
								var match = /.*?_.*?_.*?_(.*?)_/.exec(libraryName);
								if (typeof returnObj['tissue_types'][match[1]] === 'undefined') {
									returnObj['tissue_types'][match[1]] = 1;						
								} else {
									returnObj['tissue_types'][match[1]]++;
								}
							}
							if (/(.*?)_/.test(libraryName)) {
								var match = /(.*?)_/.exec(libraryName);
								if (typeof returnObj['library_totals'][match[1]] === 'undefined') {
									returnObj['library_totals'][match[1]] = 1;
								} else {
									returnObj['library_totals'][match[1]]++;
								}
							}

							// Determine donor
							var donor;
							if (sampleIDInfo[id]['Sample Type'] === 'Identity') {
								if (/(.*?_.*?)_/.test(libraryName)) {
									var match = /(.*?_.*?)_/.exec(libraryName);
									donor = match[1];
								} else {
									donor = libraryName;
								}
							} else if (/(.*?_.*?)_/.test(libraryName)) {
								var match = /(.*?_.*?)_/.exec(libraryName);
								donor = match[1];
							}
							if (typeof donor !== 'undefined') {
								if (typeof returnObj['donors'][donor] === 'undefined') {
									returnObj['donors'][donor] = 1;
								} else {
									returnObj['donors'][donor]++;
								}	
							}

							//Determine projects
							var project = sampleIDInfo[id]['Project Name'];
							if (typeof returnObj['projects'][project] === 'undefined') {
								returnObj['projects'][project] = 1;
							} else {
								returnObj['projects'][project]++;
							}
							returnObj['LibraryInfo_id'].push(sequencerData[i].name + '||' + sequencerData[i].positions[j].position + '||' + id);
							returnObj['libraries'].push(libraryName);
						}
						// no samples (some failed runs)
					} else {
						//console.log(sequencerData[i]);
					}
					// Number of donors by project (donor totals)
					for (var donor in returnObj['donors']) {
						if(/(.*?)_/.test(donor)) {
							var match = /(.*?)_/.exec(donor);
							var donorHead = match[1];
							if (typeof returnObj['donor_totals'][donorHead] === 'undefined') {
								returnObj['donor_totals'][donorHead] = 1;
							} else {
								returnObj['donor_totals'][donorHead]++;
							}
						}
					}
					returnObj['num_libraries'] = returnObj['LibraryInfo_id'].length;
					batch.find({_id: returnObj['_id']}).upsert().updateOne(returnObj);
				}
				batch.execute(function(err, result) {
					if (err) console.dir(err);
					db.close();
				});
			});
		});
	});
}

///////////////////////////////// DonorInfo //////////////////////////////////////////
// returns a list of donors heads and associated info
// _id: donor head
// TODO: start date, end date
exports.updateDonorInfo = function (sequencerData, sampleData) {
	MongoClient.connect(url, function(err, db) {
		var batch = db.collection('DonorInfo').initializeUnorderedBulkOp();
		var sampleIDInfo = getSampleIDInfo(sampleData);
		var returnObj = {};
		db.collection('LibraryInfo').createIndex({"skip": 1}, null, function (err) {
			if (err) return console.error(err);
			var docs = [];
			findDocuments(docs, {"skip": 1}, 'LibraryInfo', 'DonorInfo_id', db, function() {
				var skipData = {};
				for (i = 0; i < docs.length; i++) {
					if (typeof skipData[docs[i]] === 'undefined') {
						skipData[docs[i]] = 0;
					}
					skipData[docs[i]]++;
				}
				
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

				// Get all libraries per donor
				for (var i = 0; i < sequencerData.length; i++) {
					// Pooled Sample
					if (Object.prototype.toString.call(sequencerData[i].positions) === '[object Array]') {
						for (var j = 0; j < sequencerData[i].positions.length; j++) {
							for (var k = 0; k < sequencerData[i].positions[j].samples.length; k++) {
								var id = sequencerData[i].positions[j].samples[k].id;
								if (/Library Seq$/.test(sampleIDInfo[id]['Sample Type'])) {
									if (/(.*?_.*?)_/.test(sampleIDInfo[id]['Library Name'])) {
										var match = /(.*?_.*?)_/.exec(sampleIDInfo[id]['Library Name']);
										var donor = match[1];
										if (typeof returnObj[donor]['LibraryInfo_id'] === 'undefined') {
											returnObj[donor]['LibraryInfo_id'] = [];
											returnObj[donor]['libraries'] = [];
										}
										returnObj[donor]['LibraryInfo_id'].push(sequencerData[i].name + '||' + sequencerData[i].positions[j].position + '||' + id);
										returnObj[donor]['libraries'].push(sampleIDInfo[id]['Library Name']);
										if (typeof sampleIDInfo[donor] !== 'undefined') {
											returnObj[donor]['institute'] = sampleIDInfo[donor]['Institute'];
										}
										returnObj[donor]['status'] = sequencerData[i].state; //TODO: REMOVE???
									}
								}
								if (/(.*?_.*?)_/.test(sampleIDInfo[id]['Library Name'])) {
									var match = /(.*?_.*?)_/.exec(sampleIDInfo[id]['Library Name']);
									var donor = match[1];
									if (typeof sampleIDInfo[id]['External Name'] !== 'undefined') {
										returnObj[donor]['external_name'] = sampleIDInfo[id]['External Name'];
									}
									if (typeof skipData[donor] !== 'undefined') {
										returnObj[donor]['skipped_libraries'] = skipData[donor];
									}
								}
							}
						}
					} else if (typeof sequencerData[i].positions !== 'undefined') {
						var id = sequencerData[i].positions.id;
						if (/Library Seq$/.test(sampleIDInfo[id]['Sample Type'])) {
							if (/(.*?_.*?)_/.test(sampleIDInfo[id]['Library Name'])) {
								var match = /(.*?_.*?)_/.exec(sampleIDInfo[id]['Library Name']);
								var donor = match[1];
								if (typeof returnObj[donor]['LibraryInfo_id'] === 'undefined') {
									returnObj[donor]['LibraryInfo_id'] = [];
									returnObj[donor]['libraries'] = [];
								}
								returnObj[donor]['LibraryInfo_id'].push(sequencerData[i].name + '||' + sequencerData[i].positions[j].position + '||' + id);
								returnObj[donor]['libraries'].push(sampleIDInfo[id]['Library Name']);
								if (typeof sampleIDInfo[donor] !== 'undefined') {
									returnObj[donor]['institute'] = sampleIDInfo[donor]['Institute'];
								}
								returnObj[donor]['status'] = sequencerData[i].state;
								
							}
						}
						if (/(.*?_.*?)_/.test(sampleIDInfo[id]['Library Name'])) {
							var match = /(.*?_.*?)_/.exec(sampleIDInfo[id]['Library Name']);
							var donor = match[1];
							if (typeof sampleIDInfo[id]['External Name'] !== 'undefined') {
								returnObj[donor]['external_name'] = sampleIDInfo[id]['External Name'];
							}
							if (typeof skipData[donor] !== 'undefined') {
								returnObj[donor]['skipped_libraries'] = skipData[donor];
							}
						}
					}
				}

				// Get all library info for donor
				for (var donor in returnObj) {
					if (typeof returnObj[donor]['libraries'] !== 'undefined') {
						returnObj[donor]['library_total'] = returnObj[donor]['LibraryInfo_id'].length;
						for (var i = 0; i < returnObj[donor]['libraries'].length; i++) {
							//Determine number of library types (for library seqs)
							if (/.*_(.*?)$/.test(returnObj[donor]['libraries'][i])) {
								if (typeof returnObj[donor]['library_types'] === 'undefined') {
									returnObj[donor]['library_types'] = {};
								}
								var match = /.*_(.*?)$/.exec(returnObj[donor]['libraries'][i]);
								var libraryType = match[1];
								if (typeof returnObj[donor]['library_types'][libraryType] === 'undefined') {
									returnObj[donor]['library_types'][libraryType] = 1;
								} else {
									returnObj[donor]['library_types'][libraryType]++;
								}
							}
							// Determine number of tissue types
							if (/.*?_.*?_.*?_(.?)/.test(returnObj[donor]['libraries'][i])) {
								if (typeof returnObj[donor]['tissue_types'] === 'undefined') {
									returnObj[donor]['tissue_types'] = {};
								}
								var match = /.*?_.*?_.*?_(.?)/.exec(returnObj[donor]['libraries'][i]);
								var tissueType = match[1];
								if (typeof returnObj[donor]['tissue_types'][tissueType] === 'undefined') {
									returnObj[donor]['tissue_types'][tissueType] = 1;
								} else {
									returnObj[donor]['tissue_types'][tissueType]++;
								}
							}	
						}
						// Remove duplicate library names (not for library seqs)
						returnObj[donor]['libraries'] = _.uniq(returnObj[donor]['libraries']);
					} else {
						returnObj[donor]['library_total'] = 0;
						returnObj[donor]['library_types'] = 'n/a';
						returnObj[donor]['tissue_types'] = 'n/a';
					}
					
					batch.find({_id: donor}).upsert().updateOne(returnObj[donor]);
				}
				batch.execute(function(err, result) {
					if (err) console.dir(err);
					db.close();
				});
			});
		});
	});
}

///////////////////////////////// LibraryInfo /////////////////////////////////
// Updates library information mongodb and inserts if it isn't in the collection
// _id: library_id (run.name||lane||template.id)
exports.updateLibraryInfo = function (sequencerData, sampleData, skipData, receiveData) {
	MongoClient.connect(url, function(err, db) {
		var batch = db.collection('LibraryInfo').initializeUnorderedBulkOp();
		var sampleIDInfo = getSampleIDInfo(sampleData);
		var sampleDateInfo = getLibraryCreatePrepDates(sampleData);
		var sampleSkipInfo = getLibrarySeqSkip(skipData);
		var sampleReceiveInfo = getLibraryReceiveDates(receiveData);
		var libraries = {};

		for (var i = 0; i < sequencerData.length; i++) {
			if (Object.prototype.toString.call(sequencerData[i].positions) === '[object Array]') {
				for (var j = 0; j < sequencerData[i].positions.length; j++) {
					for (var k = 0; k < sequencerData[i].positions[j].samples.length; k++) {
						var id = sequencerData[i].positions[j].samples[k].id;
						var _id = sequencerData[i].name + '||' + sequencerData[i].positions[j].position + '||' + id;
						if (/Library Seq$/.test(sampleIDInfo[id]['Sample Type'])) {
							var libraryName = sampleIDInfo[id]['Library Name'];
							libraries[_id] = {};
							libraries[_id]._id = _id;
							libraries[_id].template_id = id;
							libraries[_id].library_name = sampleIDInfo[id]['Library Name'];
							libraries[_id].ProjectInfo_id = sampleIDInfo[id]['Project Name'];
							libraries[_id].RunInfo_id = sequencerData[i].name;
							libraries[_id].lane = sequencerData[i].positions[j].position;
							libraries[_id].status = sequencerData[i].state;
							if (typeof sampleSkipInfo[_id] !== 'undefined') {
								libraries[_id].skip = sampleSkipInfo[_id].skip;
							}
							if (typeof sampleDateInfo[id] !== 'undefined') {
								libraries[_id].create_date = sampleDateInfo[id]['create_date'];
								libraries[_id].prep_date = sampleDateInfo[id]['prep_date'];
							} else {
								libraries[_id].create_date = 'n/a';
								libraries[_id].prep_date = 'n/a';
							}

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
							if (/(.*?_.*?)_/.test(libraryName)) {
								var match = /(.*?_.*?)_/.exec(libraryName);
								var donor = match[1];
								libraries[_id].DonorInfo_id = donor;
								if (typeof sampleIDInfo[donor] !== 'undefined') {
									if (typeof sampleIDInfo[donor]['Institute'] !== 'undefined') {
										libraries[_id].institute = sampleIDInfo[donor]['Institute'];
									} else {
										libraries[_id].institute = 'n/a';
									}
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
					libraries[_id].status = sequencerData[i].state;
					if (typeof sampleSkipInfo[_id] !== 'undefined') {
						libraries[_id].skip = sampleSkipInfo[_id].skip;
					}
					if (typeof sampleDateInfo[id] !== 'undefined') {
						libraries[_id].create_date = sampleDateInfo[id]['create_date'];
						libraries[_id].prep_date = sampleDateInfo[id]['prep_date'];
					} else {
						libraries[_id].create_date = 'n/a';
						libraries[_id].prep_date = 'n/a';
					}

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
					if (/(.*?_.*?)_/.test(libraryName)) {
						var match = /(.*?_.*?)_/.exec(libraryName);
						var donor = match[1];
						libraries[_id].DonorInfo_id = donor;
						if (typeof sampleIDInfo[donor] !== 'undefined') {
							if (typeof sampleIDInfo[donor]['Institute'] !== 'undefined') {
								libraries[_id].institute = sampleIDInfo[donor]['Institute'];
							} else {
								libraries[_id].institute = 'n/a';
							}
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

// Returns the sample prep and library creation dates by template ID
function getLibraryCreatePrepDates(sampleData) {
	var IUSsampleObj = {};
	var parentObj = {};
	var returnObj = {};

	for (var i = 0; i < sampleData.length; i++) {
		var id = sampleData[i].id;
		// If the sample name is affiliated and doesn't have children, get the parents (this is for IUS Sample Parents)
		if (/Library Seq$/.test(sampleData[i].sample_type) && typeof sampleData[i].parents !== 'undefined') { 
			IUSsampleObj[id] = {};
			IUSsampleObj[id]['IUS Sample Name'] = sampleData[i].name;
			IUSsampleObj[id]['Create Date'] = getDateTimeString(sampleData[i].created_date);

			if (/\/(\d*)$/.test(sampleData[i].parents[0])) {
				var match = /\/(\d*)$/.exec(sampleData[i].parents[0]);
				IUSsampleObj[id]['Parent ID'] = match[1];
			}
		} else {
			parentObj[id] = {};
			parentObj[id]['Parent Library Name'] = sampleData[i].name;
			parentObj[id]['Create Date'] = getDateTimeString(sampleData[i].created_date);
			parentObj[id]['Sample Type'] = sampleData[i].sample_type;
			if (typeof sampleData[i].parents !== 'undefined') {
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
		//returnObj[id]['name'] = IUSsampleObj[id]['IUS Sample Name'];
		if (typeof parentObj[parentID] === 'undefined') { // If the parent is from an IUS sample
			returnObj[id]['create_date'] = IUSsampleObj[parentID]['Create Date'];
			parentID = IUSsampleObj[parentID]['Parent ID'];
		} else {
			returnObj[id]['create_date'] = parentObj[parentID]['Create Date'];
		}
		// Determine Prep date by climbing up sample hierarchy
		if (parentObj[parentID]['Parent ID'] === 'Identity') {
			returnObj[id]['prep_date'] = parentObj[parentID]['Create Date'];
		} else {
			// Keep iterating through hierarchy until the sample type does not end with 'Library'
			while (/Library$/.test(parentObj[parentID]['Sample Type']) && parentObj[parentID]['Parent ID'] !== 'Identity') {
				parentID = parentObj[parentID]['Parent ID'];
				//console.log(parentObj[parentID]);
			}
			returnObj[id]['prep_date'] = parentObj[parentID]['Create Date'];
		}
	}

	return returnObj;
}

// Returns the library and if it was skipped or not (t/f)
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

// Maybe merge the query for sample receive dates with num skip (below)
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
// Takes in data from seqware database and updates mongodb
// _id: workflowSWID
exports.updateWorkflowInfo = function (analysisYAML) {
	MongoClient.connect(url, function(err, db) {
		var libBatch = db.collection('LibraryInfo').initializeUnorderedBulkOp();
		var runBatch = db.collection('RunInfo').initializeUnorderedBulkOp();
		var dateBatch = db.collection('DateInfo').initializeUnorderedBulkOp();
		var wfBatch = db.collection('WorkflowInfo').initializeUnorderedBulkOp();

		var analysisStatus = {};
		var runAnalysisStatus = {};
		var dateObj = {};

		client.connect(function(err) {
			if (err) return console.error(err);
			var query = 'WITH RECURSIVE workflow_run_set AS ( SELECT workflow_run_id from workflow_run),workflow_run_processings (workflow_run_id, processing_id) AS ( SELECT wr.workflow_run_id, p.processing_id from workflow_run wr JOIN workflow_run_set wrs ON wr.workflow_run_id = wrs.workflow_run_id JOIN processing p ON (wr.workflow_run_id = p.workflow_run_id or wr.workflow_run_id = p.ancestor_workflow_run_id) UNION SELECT p.workflow_run_id, pr.parent_id FROM workflow_run_processings p JOIN processing_relationship pr ON p.processing_id = pr.child_id), total_workflow_run_ius AS (SELECT wr.workflow_run_id, i.ius_id FROM workflow_run wr  JOIN workflow_run_set wrs ON wr.workflow_run_id = wrs.workflow_run_id JOIN ius_workflow_runs iwr ON wr.workflow_run_id = iwr.workflow_run_id  JOIN ius i ON iwr.ius_id = i.ius_id UNION SELECT wrp.workflow_run_id, i.ius_id FROM workflow_run_processings wrp JOIN processing_ius pi ON wrp.processing_id = pi.processing_id JOIN ius i ON pi.ius_id = i.ius_id),workflow_run_template_ids AS (SELECT twri.workflow_run_id, array_agg(sa.value) as template_id, array_agg(distinct(sr.name)) as RunInfo_id, array_agg(sr.name || \'||\' || l.lane_index+1 || \'||\' || sa.value || \'||\' || i.sw_accession) as LibraryInfo_id FROM total_workflow_run_ius twri JOIN ius i ON twri.ius_id = i.ius_id JOIN lane AS l ON i.lane_id = l.lane_id JOIN sequencer_run AS sr ON l.sequencer_run_id = sr.sequencer_run_id JOIN sample s ON i.sample_id = s.sample_id JOIN sample_attribute sa ON s.sample_id = sa.sample_id WHERE sa.tag = \'geo_template_id\' GROUP BY twri.workflow_run_id ) SELECT wr.sw_accession as _id,wr.sw_accession,wr.workflow_run_id,wr.status,wr.status_cmd,wr.create_tstmp,COALESCE(p.last_modified, wr.create_tstmp) as last_modified,w.name,w.version, wrti.template_id, wrti.RunInfo_id,wrti.LibraryInfo_id FROM workflow_run_set wrs JOIN workflow_run wr ON wrs.workflow_run_id = wr.workflow_run_id JOIN workflow_run_template_ids wrti ON wrs.workflow_run_id = wrti.workflow_run_id  JOIN workflow AS w ON wr.workflow_id = w.workflow_id LEFT OUTER JOIN (SELECT workflow_run_id, MAX(update_tstmp) AS last_modified FROM processing GROUP BY workflow_run_id ) AS p ON p.workflow_run_id = wr.workflow_run_id;';

			client.query(query, function (err, result) {
				if (err) console.error(err);
				//console.log(result);
				var jsonData = result.rows;

				for (var i = 0; i < jsonData.length; i++) {
					// Update WorkflowInfo
					var workflowName = jsonData[i].name;
					var WorkflowInfo_id = parseInt(jsonData[i]._id);
					for (var analysisType in analysisYAML) {
						if (workflowName in analysisYAML[analysisType]) {
							jsonData[i].analysis_type = analysisType;
						}
					}
					jsonData[i].workflow_name = workflowName + '_' + jsonData[i].version;
					jsonData[i].create_tstmp = getDateTimeString(jsonData[i].create_tstmp);
					jsonData[i].last_modified = getDateTimeString(jsonData[i].last_modified);
					wfBatch.find({'_id':jsonData[i]._id}).upsert().updateOne(jsonData[i]);

					// Update workflows, libraries, runs for each date
					if (/(.*?) /.test(jsonData[i].last_modified)) {
						var dates = /(.*?) /.exec(jsonData[i].last_modified);
						var date = dates[1];
						if (typeof dateObj[date] === 'undefined') {
							dateObj[date] = {};
							dateObj[date]._id = date;
							dateObj[date].LibraryInfo_id = [];
							dateObj[date].RunInfo_id = [];
							dateObj[date].WorkflowInfo_id = [];
							dateObj[date].num_complete_workflows = 0;
						}
						dateObj[date]['WorkflowInfo_id'].push(WorkflowInfo_id);
						dateObj[date].RunInfo_id = dateObj[date].RunInfo_id.concat(jsonData[i].runinfo_id);
						for (var j = 0; j < jsonData[i].libraryinfo_id.length; j++) {
							var seq = /(.*?\|\|.*?\|\|.*?)\|\|.*?$/.exec(jsonData[i].libraryinfo_id[j]);
							var librarySeq_id = seq[1];
							dateObj[date]['LibraryInfo_id'].push(librarySeq_id);
						}
						if (jsonData[i].status === 'completed') {
							dateObj[date].num_complete_workflows++;
						}
					}
					for (var j = 0; j < jsonData[i].libraryinfo_id.length; j++) {
						// Parse out ids from libraryinfo_id
						var match = /((.*?)\|\|.*?\|\|.*?)\|\|(.*?)$/.exec(jsonData[i].libraryinfo_id[j]);
						var librarySeq_id = match[1];
						var runName = match[2];
						var iusswid = match[3];

						// Update workflow info library ids to library seq ids
						jsonData[i].libraryinfo_id[j] = librarySeq_id;

						// Update workflows for each library id
						if (typeof analysisStatus[librarySeq_id] === 'undefined') {
							analysisStatus[librarySeq_id] = {};
							analysisStatus[librarySeq_id]['WorkflowInfo_id'] = [];
							analysisStatus[librarySeq_id]['iusswid'] = iusswid; //only for libraries with workflows 
						}
						analysisStatus[librarySeq_id]['WorkflowInfo_id'].push(WorkflowInfo_id);

						if (jsonData[i].status !== 'submitted_cancel') {
							if (typeof analysisStatus[librarySeq_id]['analysis_total'] === 'undefined') {
								analysisStatus[librarySeq_id]['analysis_total'] = {};
							}
							for (var analysisType in analysisYAML) {
								if (workflowName in analysisYAML[analysisType]) {
									// Sample
									if (typeof analysisStatus[librarySeq_id]['analysis_total'][analysisType] === 'undefined') {
										analysisStatus[librarySeq_id]['analysis_total'][analysisType] = {};
									}
									if (typeof analysisStatus[librarySeq_id]['analysis_total'][analysisType][jsonData[i].status] === 'undefined') {
										analysisStatus[librarySeq_id]['analysis_total'][analysisType][jsonData[i].status] = 1;
									} else {
										analysisStatus[librarySeq_id]['analysis_total'][analysisType][jsonData[i].status]++;	
									}
								}
							}
						}
					}
					// Update Run Analysis totals
					for (var j = 0; j < jsonData[i].runinfo_id.length; j++) {
						var runName = jsonData[i].runinfo_id[j];
						if (jsonData[i].status !== 'submitted_cancel') {
							for (var analysisType in analysisYAML) {
								if (workflowName in analysisYAML[analysisType]) {
									if (typeof runAnalysisStatus[runName] === 'undefined') {
										runAnalysisStatus[runName] = {};
									}
									if (typeof runAnalysisStatus[runName][analysisType] === 'undefined') {
										runAnalysisStatus[runName][analysisType] = {};
									}
									if (typeof runAnalysisStatus[runName][analysisType][jsonData[i].status] === 'undefined') {
										runAnalysisStatus[runName][analysisType][jsonData[i].status] = 1;
									} else {
										runAnalysisStatus[runName][analysisType][jsonData[i].status]++;	
									}
								}
							}
						}
					}
				}

				// Sets the analysis status of workflows totals in LibraryInfo collection
				for (var librarySeq_id in analysisStatus) {
					var setMod = { $set:{} };
					analysisStatus[librarySeq_id]['num_workflows'] = analysisStatus[librarySeq_id]['WorkflowInfo_id'].length;
					setMod.$set = analysisStatus[librarySeq_id];
					//console.log(setMod);
					libBatch.find({_id: librarySeq_id}).upsert().updateOne(setMod);
				}

				// Sets the analysis status of workflows totals in RunInfo collection
				for (var runName in runAnalysisStatus) {
					var setMod = { $set: {analysis_total: {} } };
					setMod.$set.analysis_total = runAnalysisStatus[runName];
					runBatch.find({_id: runName}).upsert().updateOne(setMod);
				}
				
				// Updates the date info collection with libraries, runs occurring on each date
				for (var date in dateObj) {
					dateObj[date].RunInfo_id = _.uniq(dateObj[date].RunInfo_id);
					dateObj[date].LibraryInfo_id = _.uniq(dateObj[date].LibraryInfo_id);
					dateObj[date].num_runs = dateObj[date]['RunInfo_id'].length;
					dateObj[date].num_libraries = dateObj[date]['LibraryInfo_id'].length; // This only represents the number of libraries for that date (the same library could have workflows on another date too)
					dateObj[date].num_workflows = dateObj[date]['WorkflowInfo_id'].length;
					dateBatch.find({_id: date}).upsert().updateOne(dateObj[date]);
				}
				wfBatch.execute(function(err, result) {
					if (err) console.dir(err);
				})
				libBatch.execute(function(err, result) {
					if (err) console.dir(err);
				});
				runBatch.execute(function(err, result) {
					if (err) console.dir(err);
				});
				dateBatch.execute(function(err, result) {
					if (err) console.dir(err);
					db.close();
				});
				client.end();
			});
		});
	});
}

///////////////////////////////// FilesInfo ////////////////////////////////////
// updates mongodb list of files and links to associated WorkflowInfo_id
// _id: fileSWID
exports.updateFilesInfo = function (fprData) {
	MongoClient.connect(url, function (err, db) {
		var batch = db.collection('FilesInfo').initializeUnorderedBulkOp();
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

// Checks for running sequencer runs using seqware db sequencer runs and pinery sequencer runs
// Does a check for existing sequencer runs in mongodb
exports.updateRunningSequencerRuns = function (sequencerData, jsonData) {
	MongoClient.connect(url, function(err, db) {
		if (err) return console.error(err);
		var currentRunBatch = db.collection('CurrentSequencerRuns').initializeUnorderedBulkOp();
		var runBatch = db.collection('RunInfo').initializeUnorderedBulkOp();
		var running = [];
		var complete = [];
		var docs = [];
		findAllDocuments(docs, 'CurrentSequencerRuns', db, function() {
			for (var i = 0; i < sequencerData.length; i++) {
				// Check if exisitng documents are completed, then remove from collection
				if (isInArray(sequencerData[i].name, docs)) {
					if (sequencerData[i].state !== 'Running'){
						currentRunBatch.find({_id: sequencerData[i].name}).removeOne();
						runBatch.find({_id: sequencerData[i].name}).upsert().updateOne({ $set: {status: sequencerData[i].state} });
					}
				}
				// Add running to CurrentSequencerRuns table
				if (sequencerData[i].state === 'Running' && new Date(sequencerData[i].created_date) > new Date('2014-02-01 00:00:00')) {
					var obj = {};
					obj['_id'] = sequencerData[i].name;
					obj['created_date'] = getDateTimeString(sequencerData[i].created_date);
					obj['status'] = sequencerData[i].state;
					currentRunBatch.find({_id: obj['_id']}).upsert().updateOne(obj);
					running.push(sequencerData[i].name); 
				// Change RunInfo status to failed
				} else if (sequencerData[i].state === 'Failed') {
					runBatch.find({_id: sequencerData[i].name}).upsert().updateOne({ $set: {status: 'Failed'} });
				}
			}

			// Remove from CurrentSequencerRuns table if in psql database
			for (var i = 0; i < jsonData.length; i++) {
				complete.push(jsonData[i].sequencer_run_name);
			}
			var completed = _.intersection(running, complete);
			for (var i = 0; i < completed.length; i++) {
				currentRunBatch.find({_id: completed[i]}).removeOne();
			}
			currentRunBatch.execute(function(err, result) {
				if (err) console.dir(err);
			});
			runBatch.execute(function(err, result) {
				if (err) console.dir(err);
				db.close();
			});
		});
	});
}

// Checks for running workflow runs in seqware database
// Does a check for existing workflow runs in mongodb
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
				var query = 'WITH RECURSIVE workflow_run_set AS (SELECT workflow_run_id from workflow_run where ' + ids + ' status = \'running\'), workflow_run_processings (workflow_run_id, processing_id) AS (SELECT wr.workflow_run_id, p.processing_id from workflow_run wr JOIN workflow_run_set wrs ON wr.workflow_run_id = wrs.workflow_run_id JOIN processing p ON (wr.workflow_run_id = p.workflow_run_id or wr.workflow_run_id = p.ancestor_workflow_run_id) UNION SELECT p.workflow_run_id, pr.parent_id FROM workflow_run_processings p JOIN processing_relationship pr ON p.processing_id = pr.child_id), total_workflow_run_ius AS (SELECT wr.workflow_run_id, i.ius_id FROM workflow_run wr  JOIN workflow_run_set wrs ON wr.workflow_run_id = wrs.workflow_run_id JOIN ius_workflow_runs iwr ON wr.workflow_run_id = iwr.workflow_run_id  JOIN ius i ON iwr.ius_id = i.ius_id UNION SELECT wrp.workflow_run_id, i.ius_id FROM workflow_run_processings wrp JOIN processing_ius pi ON wrp.processing_id = pi.processing_id JOIN ius i ON pi.ius_id = i.ius_id),workflow_run_template_ids AS (SELECT twri.workflow_run_id, array_agg(sa.value) as template_id, array_agg(distinct(sr.name)) as RunInfo_id, array_agg(sr.name || \'||\' || l.lane_index+1 || \'||\' || sa.value || \'||\' || i.sw_accession) as LibraryInfo_id FROM total_workflow_run_ius twri JOIN ius i ON twri.ius_id = i.ius_id JOIN lane AS l ON i.lane_id = l.lane_id JOIN sequencer_run AS sr ON l.sequencer_run_id = sr.sequencer_run_id JOIN sample s ON i.sample_id = s.sample_id JOIN sample_attribute sa ON s.sample_id = sa.sample_id WHERE sa.tag = \'geo_template_id\' GROUP BY twri.workflow_run_id ) SELECT wr.sw_accession as _id,wr.sw_accession,wr.workflow_run_id,wr.status,wr.status_cmd,wr.create_tstmp,COALESCE(p.last_modified, wr.create_tstmp) as last_modified,w.name,w.version, wrti.template_id, wrti.RunInfo_id,wrti.LibraryInfo_id FROM workflow_run_set wrs JOIN workflow_run wr ON wrs.workflow_run_id = wr.workflow_run_id JOIN workflow_run_template_ids wrti ON wrs.workflow_run_id = wrti.workflow_run_id  JOIN workflow AS w ON wr.workflow_id = w.workflow_id LEFT OUTER JOIN (SELECT workflow_run_id, MAX(update_tstmp) AS last_modified FROM processing GROUP BY workflow_run_id ) AS p ON p.workflow_run_id = wr.workflow_run_id;';
				//console.log(query);

				client.query(query, function (err, result) {
					if (err) console.error(err);
					//console.log(result);
					for (var i = 0; i < result.rows.length; i++) {
						// Update workflow info
						var WorkflowInfo_id = parseInt(result.rows[i]._id);
						var workflowName = result.rows[i].name;
						for (var analysisType in analysisYAML) {
							if (workflowName in analysisYAML[analysisType]) {
								result.rows[i].analysis_type = analysisType;
							}
						}
						result.rows[i].workflow_name = workflowName + '_' + result.rows[i].version;
						result.rows[i].create_tstmp = getDateTimeString(result.rows[i].create_tstmp);
						result.rows[i].last_modified = getDateTimeString(result.rows[i].last_modified);

						for (var j = 0; j < result.rows[i].libraryinfo_id.length; j++) {
							// Parse out ids from libraryinfo_id
							var match = /(.*?\|\|.*?\|\|.*?)\|\|.*?$/.exec(result.rows[i].libraryinfo_id[j]);
							var librarySeq_id = match[1];

							// Update workflow info library ids to library seq ids
							result.rows[i].libraryinfo_id[j] = librarySeq_id;

							// Update library and run analysis totals with the complete WorkflowInfo update
						}

						// Update running workflow table
						if (result.rows[i].status === 'running') {
							currentWFBatch.find({_id: result.rows[i]._id}).upsert().updateOne(result.rows[i]);
							wfBatch.find({_id: result.rows[i]._id}).upsert().updateOne(result.rows[i]);
						// Update failed workflow table and workflow info table
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

// Checks the failed workflow run table for change in status and updates accordingly
function checkFailedWorkflowRuns (sequencerData) {
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
					var query = 'WITH RECURSIVE workflow_run_set AS (SELECT workflow_run_id from workflow_run where sw_accession in ( ' + docs.join() + ' ) ), workflow_run_processings (workflow_run_id, processing_id) AS (SELECT wr.workflow_run_id, p.processing_id from workflow_run wr JOIN workflow_run_set wrs ON wr.workflow_run_id = wrs.workflow_run_id JOIN processing p ON (wr.workflow_run_id = p.workflow_run_id or wr.workflow_run_id = p.ancestor_workflow_run_id) UNION SELECT p.workflow_run_id, pr.parent_id FROM workflow_run_processings p JOIN processing_relationship pr ON p.processing_id = pr.child_id), total_workflow_run_ius AS (SELECT wr.workflow_run_id, i.ius_id FROM workflow_run wr  JOIN workflow_run_set wrs ON wr.workflow_run_id = wrs.workflow_run_id JOIN ius_workflow_runs iwr ON wr.workflow_run_id = iwr.workflow_run_id  JOIN ius i ON iwr.ius_id = i.ius_id UNION SELECT wrp.workflow_run_id, i.ius_id FROM workflow_run_processings wrp JOIN processing_ius pi ON wrp.processing_id = pi.processing_id JOIN ius i ON pi.ius_id = i.ius_id),workflow_run_template_ids AS (SELECT twri.workflow_run_id, array_agg(sa.value) as template_id, array_agg(distinct(sr.name)) as RunInfo_id, array_agg(sr.name || \'||\' || l.lane_index+1 || \'||\' || sa.value || \'||\' || i.sw_accession) as LibraryInfo_id FROM total_workflow_run_ius twri JOIN ius i ON twri.ius_id = i.ius_id JOIN lane AS l ON i.lane_id = l.lane_id JOIN sequencer_run AS sr ON l.sequencer_run_id = sr.sequencer_run_id JOIN sample s ON i.sample_id = s.sample_id JOIN sample_attribute sa ON s.sample_id = sa.sample_id WHERE sa.tag = \'geo_template_id\' GROUP BY twri.workflow_run_id ) SELECT wr.sw_accession as _id,wr.sw_accession,wr.workflow_run_id,wr.status,wr.status_cmd,wr.create_tstmp,COALESCE(p.last_modified, wr.create_tstmp) as last_modified,w.name,w.version, wrti.template_id, wrti.RunInfo_id,wrti.LibraryInfo_id FROM workflow_run_set wrs JOIN workflow_run wr ON wrs.workflow_run_id = wr.workflow_run_id JOIN workflow_run_template_ids wrti ON wrs.workflow_run_id = wrti.workflow_run_id  JOIN workflow AS w ON wr.workflow_id = w.workflow_id LEFT OUTER JOIN (SELECT workflow_run_id, MAX(update_tstmp) AS last_modified FROM processing GROUP BY workflow_run_id ) AS p ON p.workflow_run_id = wr.workflow_run_id;';
					
					client.query(query, function (err, result) {
						if (err) console.error(err);
						//console.log(result);
						for (var i = 0; i < result.rows.length; i++) {
							if (result.rows[i].status !== 'failed') {
								// Update workflow info
								var WorkflowInfo_id = parseInt(result.rows[i]._id);
								var workflowName = result.rows[i].name;
								for (var analysisType in analysisYAML) {
									if (workflowName in analysisYAML[analysisType]) {
										result.rows[i].analysis_type = analysisType;
									}
								}
								result.rows[i].workflow_name = workflowName + '_' + result.rows[i].version;
								result.rows[i].create_tstmp = getDateTimeString(result.rows[i].create_tstmp);
								result.rows[i].last_modified = getDateTimeString(result.rows[i].last_modified);

								for (var j = 0; j < result.rows[i].libraryinfo_id.length; j++) {
									// Parse out ids from libraryinfo_id
									var match = /(.*?\|\|.*?\|\|.*?)\|\|.*?$/.exec(result.rows[i].libraryinfo_id[j]);
									var librarySeq_id = match[1];

									// Update workflow info library ids to library seq ids
									result.rows[i].libraryinfo_id[j] = librarySeq_id;

									// Update library and run analysis totals with the complete WorkflowInfo update
								}

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

// Takes in jsonFile, xenomeFile (for % mouse content), and an existing object and returns report data to that object
function getReportData(jsonFile, xenomeFile) {
	var obj = {};
	if (typeof jsonFile !== 'undefined') {
		var jsonString = fs.readFileSync(jsonFile, 'utf8'); 
		var lineObj = JSON.parse(jsonString);

		// Initialize
		var readsSP = parseFloat(lineObj['reads per start point']).toFixed(2);
		var onTargetRate = lineObj['reads on target']/lineObj['mapped reads'];

		// Run Name
		obj['Run Name'] = lineObj['run name'];

		// Lane
		obj['Lane'] = lineObj['lane'];

		// Barcode
		if (typeof lineObj['barcode'] === 'undefined') {
			obj['Barcode'] = 'noIndex';
		} else {
			obj['Barcode'] = lineObj['barcode'];
		}

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
			obj['_id'] = IUSSWID;
			obj['library_name'] = fprData['Library'][IUSSWID]['Library Name'];
			obj['data'] = getReportData(json, xenomeFile);

			//Update in mongodb
			batch.find({_id: IUSSWID}).upsert().updateOne(obj);
		}
		batch.execute(function(err, result) {
			if (err) console.dir(err);
			db.close();
		});
	});
}

// Takes in zip files and returns an object of all alignment QC RNA Seq data
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
	zipEntries.forEach(function(zipEntry) {
		if (zipEntry.entryName == dir + 'CollectRNASeqMetricsSummary.txt'){
			picard = zipEntry.getData().toString('utf8').split('\n');
			metrics = picard[1].split('\t');
		} else if (zipEntry.entryName == dir + 'ReadsPerStartPoint.txt'){
			uniq = zipEntry.getData().toString('utf8').split('\n');
		} else if (zipEntry.entryName == dir + 'rRNAcontaminationSummary.txt'){
			contam = zipEntry.getData().toString('utf8').split('\n');
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
	if (PCT_CORRECT_STRAND_READS !== 0) {
		obj['Proportion Correct Strand Reads'] = PCT_CORRECT_STRAND_READS;
	} else {
		obj['Proportion Correct Strand Reads'] = 'Not a Strand Specific Library';
	}
	obj['Median CV Coverage'] = MEDIAN_CV_COVERAGE;
	obj['Median 5Prime Bias'] = MEDIAN_5PRIME_BIAS;
	obj['Median 3Prime Bias'] = MEDIAN_3PRIME_BIAS;
	obj['Median 5Prime to 3Prime Bias'] = MEDIAN_5PRIME_TO_3PRIME_BIAS;
	// rRNA Contamination (%reads aligned)
	if (TOTAL_READS !== 0) {
		obj['% rRNA Content'] = ((RIBOSOMAL_READS/TOTAL_READS)*100).toFixed(2);
	} else {
		obj['% rRNA Content'] = 'Total Reads Job Failed -> re-run report';
	}
	return obj;
}

// Returns all RNA Seq QC data by running the above function getRNASeqQCData
exports.updateIUSSWIDRNASeqQCData = function (fprData) {
	MongoClient.connect(url, function(err, db) {
		if (err) console.error(err);
		var batch = db.collection('IUSSWIDRNASeqQCData').initializeUnorderedBulkOp();

		for (var IUSSWID in fprData['Library']) {
			if (typeof fprData['Library'][IUSSWID]['RNAZipFile'] !== 'undefined') {
				var obj = {};
				obj['_id'] = IUSSWID;
				obj['library_name'] = fprData['Library'][IUSSWID]['Library Name'];
				obj['data'] = getRNASeqQCData(fprData['Library'][IUSSWID]['RNAZipFile']);
				for (var runSWID in fprData['Library'][IUSSWID]['Run']) {
					obj['data']['run_name'] = fprData['Library'][IUSSWID]['Run'][runSWID];
				}
				obj['data']['lane'] = fprData['Library'][IUSSWID]['Lane'];

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

// Takes in json file and generates graph data
exports.updateGraphData = function (fprData) {
	// Charts generated using Google charts
	MongoClient.connect(url, function (err, db) {
		if (err) console.error(err);
		var batch = db.collection('IUSSWIDGraphData').initializeUnorderedBulkOp();
		for (var IUSSWID in fprData['Library']) {
			if (typeof fprData['Library'][IUSSWID]['JSON'] !== 'undefined') {
				var jsonString = fs.readFileSync(fprData['Library'][IUSSWID]['JSON'], 'utf8');
				var lineObj = JSON.parse(jsonString);

				if (typeof lineObj['barcode'] === 'undefined'){
					lineObj['barcode'] = 'NoIndex';
				}
				//var id = lineObj['run name'] + '_L00' + lineObj['lane'] + '_' + lineObj['barcode'] + '_' + lineObj['library'];
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
				// initialize objects
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

// Draws graphs by reading data produced by generateGraphDataByJSON and adding data to html given sample id which is in format: runName_lane_barcode_library
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

	// Output to html
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
//drawGraphsById('8851');

// Searches mongodb collection IUSSWIDReportData and IUSSWIDRNAReportData for yield and read totals and adds them up per lane/run
// Returns values into ReportRunData
exports.updateLaneDetailsTotalsByRun = function () {
	MongoClient.connect(url, function (err, db) {
		if (err) console.error(err);
		var batch = db.collection('ReportRunData').initializeUnorderedBulkOp();

		var docs = [];
		findReportDocuments(docs, db, function() {
			var runObj = {};
			for (var i = 0; i < docs.length; i++) {
				if (typeof runObj[docs[i].run] === 'undefined') {
					runObj[docs[i].run] = {};
					runObj[docs[i].run]['reads'] = 0;
					runObj[docs[i].run]['yield'] = 0;
					runObj[docs[i].run]['% target'] = 0;
					runObj[docs[i].run]['num_libraries'] = 0;
				}
				if (typeof runObj[docs[i].run]['lane_' + docs[i].lane] === 'undefined') {
					runObj[docs[i].run]['lane_' + docs[i].lane] = {};
					runObj[docs[i].run]['lane_' + docs[i].lane]['raw_yield'] = 0;
					runObj[docs[i].run]['lane_' + docs[i].lane]['raw_reads'] = 0;
					runObj[docs[i].run]['lane_' + docs[i].lane]['num_libraries'] = 0;
				}
				runObj[docs[i].run]['reads'] += docs[i].reads;
				runObj[docs[i].run]['yield'] += docs[i].yield;
				runObj[docs[i].run]['% target'] += docs[i].target;
				runObj[docs[i].run]['num_libraries']++;
				runObj[docs[i].run]['lane_' + docs[i].lane]['raw_yield'] += docs[i].yield;
				runObj[docs[i].run]['lane_' + docs[i].lane]['raw_reads'] += docs[i].reads;
				runObj[docs[i].run]['lane_' + docs[i].lane]['num_libraries']++;
			}
			for (var run in runObj) {
				batch.find({_id: run}).upsert().updateOne(runObj[run]);
			}
			batch.execute(function(err, result) {
				if (err) console.dir(err);
				db.close();
			});
		});
	});
}

// Pinery
function getSampleIDInfo(sampleData) {
	var returnObj = {};

	for (var i = 0; i < sampleData.length; i++) {
		returnObj[sampleData[i]['id']] = {};
		returnObj[sampleData[i]['id']]['Library Name'] = sampleData[i]['name'];
		returnObj[sampleData[i]['id']]['Start Date'] = sampleData[i]['created_date'];
		returnObj[sampleData[i]['id']]['Project Name'] = sampleData[i]['project_name'];
		returnObj[sampleData[i]['id']]['Sample Type'] = sampleData[i]['sample_type'];
		if (typeof sampleData[i].attributes !== 'undefined') {
			for (var j = 0; j < sampleData[i].attributes.length; j++) {
				// Assuming all samples with the same donor head come from the same institute
				var donor;
				if (sampleData[i].attributes[j].name === 'Institute') {
					if (/(.*?_.*?)_/.test(sampleData[i].name)) {
						var match = /(.*?_.*?)_/.exec(sampleData[i].name);
						donor = match[1];
					} else {
						donor = sampleData[i].name;
					}
					if (typeof returnObj[donor] === 'undefined') {
						returnObj[donor] = {};
					}
					returnObj[donor]['Institute'] = sampleData[i].attributes[j].value;
					//returnObj[sampleData[i]['id']]['Institute'] = sampleData[i].attributes[j].value;
				} else if (sampleData[i].attributes[j].name === 'Tissue Origin') {
					if (/(.*?_.*?)_/.test(sampleData[i].name)) {
						var match = /(.*?_.*?)_/.exec(sampleData[i].name);
						donor = match[1];
					} else {
						donor = sampleData[i].name;
					}
					if (typeof returnObj[donor] === 'undefined') {
						returnObj[donor] = {};
					}
					returnObj[donor]['Tissue Origin'] = sampleData[i].attributes[j].value;
				} else if (sampleData[i].attributes[j].name === 'External Name') {
					returnObj[sampleData[i]['id']]['External Name'] = sampleData[i].attributes[j].value;
				}
			}
		}
	}

	return returnObj;
}

function getProjectDataInfo(projectData) {
	var returnObj = {};

	for (var i = 0; i < projectData.length; i++) {
		returnObj[projectData[i].name] = {};
		returnObj[projectData[i].name]['Start Date'] = projectData[i].earliest;
		returnObj[projectData[i].name]['Last Modified'] = projectData[i].latest;
		returnObj[projectData[i].name]['Count'] = projectData[i].count;
	}

	return returnObj;
}

function getSkipTotal(category) {
	MongoClient.connect(url, function (err, db) {
		db.collection('LibraryInfo').createIndex({"skip": 1}, null, function (err) {
			if (err) return console.error(err);
			var docs = [];
			findDocuments(docs, {"skip": 1}, 'LibraryInfo', category + 'Info_id', db, function() {
				var skip = {};
				for (i = 0; i < docs.length; i++) {
					if (typeof skip[docs[i]] === 'undefined') {
						skip[docs[i]] = 0;
					}
					skip[docs[i]]++;
				}

				return skip;

				db.close();
			});
		});
	});
}

// ETC
// takes in a date object or date string and converts it into %Y-%m-%d %H:%M:%S format
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

// check if value is in the array
function isInArray(value, array) {
	return array.indexOf(value) > -1;
}
// updates provided info in mongodb for a particular field given the field_value
function updateDataField(collection, field_value, data) {
 	MongoClient.connect(url, function(err, db) {
		if (err) return console.error(err);
		console.log('connected');

		// Return updated info to mongodb, insert if not already in db
		db.collection(collection).updateOne(field_value, data, {upsert: true}, function (err) {
			if (err) return console.error(err);
			db.close();
		});
	});
}

// removes document from collection in mongodb
function removeDataField(collection, field_value) {
	MongoClient.connect(url, function(err, db) {
		if (err) return console.error(err);
		console.log('removing');

		db.collection(collection).deleteOne(field_value, function (err) {
			if (err) return console.error(err);
			db.close();
		});
	});
}

// returns all documents using a specific query in a specific collection
function findDocuments(docs, query, collection, returnField, db, callback) {
	var cursor = db.collection(collection).find(query);
	cursor.each(function(err, doc) {
		if (err) return console.error(err);

		if (doc != null) {
			docs.push(doc[returnField]);
		} else {
			callback();
			return docs;
		}
	});
};

// returns all documents in a collection
function findAllDocuments(docs, collection, db, callback) {
	console.log('finding');
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
/*
MongoClient.connect(url, function(err, db) {
	if (err) return console.error(err);
	db.collection('RunInfo').find({_id:1010}, {LibraryInfo_id:1, _id:0}).each(function(err, doc) {
		if (err) return console.error(err);

		if (doc != null) {
			for (key in doc) {
				db.collection('LibraryInfo').find( {_id: { $in: doc[key] } }).each(function (err, items) {
					if (err) return console.error(err);
					console.log(items);
					db.close();
				});
			}
		}
	});
});
*/