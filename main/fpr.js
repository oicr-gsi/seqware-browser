// Send get requests to this script to obtain file provenance report data in JSON format

var fs = require('fs');
var _ = require('underscore');
var YAML = require('yamljs');
var readMultipleFiles = require('read-multiple-files');
var http = require("http");
var AdmZip = require('adm-zip');

var	mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var ObjectId = mongodb.ObjectID;
var url = 'mongodb://127.0.0.1:27017/seqwareBrowser';

var Highcharts = require('highcharts');

var dateNow = new Date();
var analysisYAML;

/*
// read fpr-Project/fpr-Workflow/fpr-Library JSON created by associated perl script
//TODO: Maybe create a separate JSON just for this?
readMultipleFiles([process.argv[3], process.argv[4], process.argv[6]], 'utf8', function(err, data){
	if (err) return console.error(err);
	console.log("starting project-workflow-library");
	fprData = _.extend(JSON.parse(data[0]), JSON.parse(data[1]));
	fprData = _.extend(fprData, JSON.parse(data[2]));

	// function requiring project, workflow, library information

	var obj;
	//obj = getCurrentStats(fprData, '', '');

	if (typeof obj !== 'undefined') {
		obj = JSON.stringify(obj);
		console.log(obj);
	}
});

// read fpr-Project
fs.readFile(process.argv[4], 'utf8', function(err, data){
	if (err) return console.error(err);
	console.log("starting project");
	fprDataProject = JSON.parse(data);

	// functions associated with project key
	
	var obj;

	// Mongodb functions

	//getLastModifiedProjects(fprDataProject, 60);

	//var dates = getStartDateAllProjects(fprDataProject);
	//var status = getAnalysisStatusAllProjects(fprDataProject, null, analysisYAML);
	//var numDonors = getNumDonorsAllProjects(fprDataProject);
	//var numLibraries = getNumLibrariesAllProjects(fprDataProject);
	//var runData = getRunDataAllProjects(fprDataProject, '2015-01-01 00:00:00', '', analysisYAML);
	
	for (var projectSWID in fprDataProject['Project']) {
		//getCurrentStatsByProject(fprDataProject, '', '', projectSWID);
		//getStartDateByProject(dates, projectSWID);
		//getAnalysisStatusByProject(status, projectSWID);
		//getNumDonorsByProject(numDonors, projectSWID);
		//getDonorsByProject(fprDataProject, projectSWID);
		//getNumLibrariesByProject(numLibraries, projectSWID);
		//getLibrariesByProject(fprDataProject, projectSWID);
		//getRunDataByProject(runData, projectSWID);
	}

 //////// SOME FUNCTIONS HAVE DIFFERENT INPUTS NOW////////////////

	//obj = getCurrentStatsByProject(fprDataProject, '', '', '10');
	//obj = getLastModifiedProjects(fprDataProject, 30);
	
	
	//obj = getStartDateByProject(fprDataProject, '10');
	//obj = getAnalysisStatusAllProjects(fprDataProject, 30, analysisYAML);
	//obj = getAnalysisStatusByProject(fprDataProject, analysisYAML, '10');

	//obj = getNumDonorsAllProjects(fprDataProject);
	//obj = getNumDonorsByProject(fprDataProject, '10');
	//obj = getDonorsByProject(fprDataProject, '10');
	
	//obj = getNumLibrariesAllProjects(fprDataProject);
	//obj = getNumLibrariesByProject(fprDataProject, '10');
	//obj = getLibrariesByProject(fprDataProject, '10');

	//obj = getRunDataAllProjects(fprDataProject, '2015-01-01 00:00:00', '', analysisYAML);
	//obj = getRunDataByProject(fprDataProject, '2015-01-01 00:00:00', '', '10', analysisYAML);
	
	if (typeof obj !== 'undefined') {
		obj = JSON.stringify(obj);
		console.log(obj);
	}
});

// read fpr-Run JSON
fs.readFile(process.argv[5], 'utf8', function(err, data){
	if (err) return console.error(err);
	//console.log("starting run");
	fprDataRun = JSON.parse(data);

	// functions associated with run key
	var obj;
	
	for (var runSWID in fprDataRun['Run']) {
		//getLibrariesByRun(libraries, runSWID);
		if (typeof fprDataRun['Run'][runSWID]['Lane'] !== 'undefined') {
			for (var lane in fprDataRun['Run'][runSWID]['Lane']) {
				for (var library in fprDataRun['Run'][runSWID]['Lane'][lane]['Library']) {
					obj = getReportDataByLibraryByLaneByRun(fprDataRun, runSWID, lane, library);
					obj = JSON.stringify(obj);
					console.log(obj);
				}
			}
		}
	}
	
	for (var runSWID in fprDataRun['Run']) {
		for (var library in fprDataRun['Run'][runSWID]['Library']) {
			obj = getRNASeqQCDataByLibraryByRun(fprDataRun, runSWID, library);
			obj = JSON.stringify(obj);
			console.log(obj);
		}
	}
	
	//obj = getLibrariesAllRuns(fprDataRun);
	//obj = getLibrariesByRun(fprDataRun, '8002');

	if (typeof obj !== 'undefined') {
		obj = JSON.stringify(obj);
		//console.log(obj);
	}
});

// read fpr-Donor JSON
fs.readFile(process.argv[7], 'utf8', function(err, data){
	if (err) return console.error(err);
	console.log("starting donor");
	fprDataDonor = JSON.parse(data);

	// remove duplicates
	var donors = [];
	for (var donorSWID in fprDataDonor['Donor']) {
		donors.push(fprDataDonor['Donor'][donorSWID]['Donor Name']);

	}
	donors = _.uniq(donors);

	//functions associated with donor key
	var obj = {};
	//var donorInfo = getDonorInfo(fprDataDonor);
	//var numLibraries = getNumLibrariesPerTissueAllDonors(fprDataDonor);
	//var numLibTypes = getNumOfLibraryTypeAllDonors(fprDataDonor);
	//var dates = getStartEndDateAllDonors(fprDataDonor);
	//var instruments = getInstrumentNamesAllDonors(fprDataDonor);

	for (var i = 0; i < donors.length; i++){
		//getDonorInfoByName(donorInfo, donors[i]);
		//getNumLibrariesPerTissueByDonor(numLibraries, donors[i]);
		//getNumOfLibraryTypeByDonor(numLibTypes, donors[i]);
		//getStartEndDateByDonor(dates, donors[i]);
		//getInstrumentNamesByDonor(instruments, donors[i]);
	}
	//files = getJSONFilesByLibraryByLaneAllDonors(fprDataDonor);
	for (var donor in files) {
		if (typeof files[donor]['Lane'] !== 'undefined') {
			for (var lane in files[donor]['Lane']) {
				for (var library in files[donor]['Lane'][lane]) {
					//obj = getReportDataByLibraryByLaneByDonor(files, donor, lane, library)['Donor'];
					if (typeof obj !== 'undefined') {
						obj = JSON.stringify(obj);
						console.log(obj);
					}
				}
			}
		}
	}

	//obj = getDonorInfo(fprDataDonor);
	//obj = getDonorInfoByName(fprDataDonor, 'PCSI_0625');

	//obj = getNumLibrariesPerTissueAllDonors(fprDataDonor);
	//obj = getNumLibrariesPerTissueByDonor(fprDataDonor, 'BLBC_0013');

	//obj = getNumOfLibraryTypeAllDonors(fprDataDonor);
	//obj = getNumOfLibraryTypeByDonor(fprDataDonor, 'PCSI_0023');

	//obj = getStartEndDateAllDonors(fprDataDonor)
	//obj = getStartEndDateByDonor(fprDataDonor, 'PCSI_0023');

	//obj = getInstrumentNamesAllDonors(fprDataDonor);
	//obj = getInstrumentNamesByDonor(fprDataDonor, 'BLBC_0006_Ly_R_nn_3_D_1');

	//files = getJSONFilesByLibraryByLaneAllDonors(fprDataDonor);
	//obj = getReportData(files, 'PCSI_0023', '6', 'PCSI_0023_Pa_P_PE_700_WG');

	if (typeof obj !== 'undefined') {
		obj = JSON.stringify(obj);
		//console.log(obj);
	}
});

// can only run getReportData in the cluster sinces files are in the cluster, 
// return json file and parse it back into mongo using this func
fs.readFile(process.argv[8], 'utf8', function(err, data) {
	if (err) return console.error(err);
	console.log('connected');
	var lines = data.toString().split('\n');
	
	for (var i = 0; i < lines.length - 1; i++){
		reportData = JSON.parse(lines[i]);
		for (var key in reportData['Run']) {
			for (var lane in reportData['Run'][key]['Lane']) {
				for (var library in reportData['Run'][key]['Lane'][lane]['Library']) {
					//updateData('ReportDataByLibraryByLaneByDonor', key + '_' + lane + '_' + library, reportData);
					updateData('ReportDataByLibraryByLaneByRun', key + '_' + lane + '_' + library, reportData);
				}
			}
		}
	}
	/*
	for (var i = 0; i < lines.length - 1; i++){
		reportData = JSON.parse(lines[i]);
		for (var key in reportData['Run']) {
			for (var library in reportData['Run'][key]['Library']){
				updateData('RNASeqQCDataByLibraryByRun', key + '_' + library, reportData);
			}
		}
	}
	
});

// read fpr-Library JSON
fs.readFile(process.argv[6], 'utf8', function(err, data){
	if (err) return console.error(err);
	console.log("starting library");
	fprDataLibrary = JSON.parse(data);

	// functions associated with library key
	var obj;
	//var status = getAnalysisStatusAllLibraries(fprDataLibrary, null, analysisYAML);
	//var libraryInfo = getLibraryInfo(fprDataLibrary);
	//var workflows = getWorkflowAllLibraries(fprDataLibrary);

	for (var sampleSWID in fprDataLibrary['Library']) {
		//getAnalysisStatusByLibrary(status, sampleSWID);
		//getLibraryInfoBySWID(libraryInfo, sampleSWID);
		//getWorkflowByLibrary(workflows, sampleSWID);
	}
	//obj = getAnalysisStatusAllLibraries(fprDataLibrary, 30, analysisYAML);
	//obj = getAnalysisStatusByLibrary(fprDataLibrary, analysisYAML, '133');

	//obj = getLibraryInfo(fprDataLibrary);
	//obj = getLibraryInfoBySWID(fprDataLibrary, '165');

	//obj = getWorkflowAllLibraries(fprDataLibrary);
	//obj = getWorkflowByLibrary(fprDataLibrary, '165');

	if (typeof obj !== 'undefined') {
		obj = JSON.stringify(obj);
		console.log(obj);
	}
});

// read YAML containing info on workflows and their analysis type
fs.readFile(process.argv[2], 'utf8', function(err, data){
	if (err) return console.error(err);
	console.log("reading yaml");
	analysisYAML = YAML.parse(data);
	//console.log(analysisYAML);
});
*/
/////////////////////////////// Functions ///////////////////////////////

// returns current stats such as workflow run status, total projects, total libraries
function getCurrentStats (fprData, dateFrom, dateTo){
	var returnObj = {};
	if (dateFrom === '') {
		returnObj['Date From'] = 'Unspecified';
	} else {
		returnObj['Date From'] = dateFrom;
	}
	if (dateTo === '' ) {
		returnObj['Date To'] = getDateTimeString(dateNow);
	} else {
		returnObj['Date To'] = dateTo;
	}
	
	//Workflow status for all projects
	returnObj = getWorkflowStatus(fprData, dateFrom, dateTo, returnObj);
	
	//Project Total
	returnObj['Total Projects'] = Object.keys(fprData['Project']).length;
	
	//Library Total
	returnObj['Total Libraries'] = Object.keys(fprData['Library']).length;
	
	// Update in mongodb
	updateData('CurrentStats', 'current', returnObj);

	return returnObj;
}

// returns number of workflow runs with complete, failed, or cancelled status in a specified time frame
function getWorkflowStatus(fprData, dateFrom, dateTo, obj) {
	var dates = convertToDateObject(dateFrom, dateTo);
	dateFrom = dates[0];
	dateTo = dates[1];
	obj['Workflow Status'] = {};
	
	for ( var workflowRunSWID in fprData['Workflow'] ) {
		var date = new Date(fprData['Workflow'][workflowRunSWID]['Last Modified']);
		if ( date <= dateTo && date >= dateFrom && typeof date !== 'undefined') {
			if (typeof obj['Workflow Status'][fprData['Workflow'][workflowRunSWID]['Status']] === 'undefined'){
				obj['Workflow Status'][fprData['Workflow'][workflowRunSWID]['Status']] = 1;
			} else {
				obj['Workflow Status'][fprData['Workflow'][workflowRunSWID]['Status']]++;
			}
		}
	}
	return obj;
}

//// By Project
// returns current stats such as workflow run status, total projects, total libraries for specified project SWID in a specific time
function getCurrentStatsByProject (fprData, dateFrom, dateTo, projectSWID) {
	var returnObj = {};
	returnObj[projectSWID] = {};
	returnObj[projectSWID]['Workflow Status'] = {};
	
	returnObj[projectSWID]['Project Name'] = fprData['Project'][projectSWID]['Project Name'];
	returnObj[projectSWID]['Project Libraries'] = Object.keys(fprData['Project'][projectSWID]['Library Name']).length;

	if (dateFrom === '') {
		returnObj[projectSWID]['Date From'] = 'Unspecified';
	} else {
		returnObj[projectSWID]['Date From'] = dateFrom;
	}
	if (dateTo === '' ) {
		returnObj[projectSWID]['Date To'] = getDateTimeString(dateNow);
	} else {
		returnObj[projectSWID]['Date To'] = dateTo;
	}
	var dates = convertToDateObject(dateFrom, dateTo);
	dateFrom = dates[0];
	dateTo = dates[1];
	
	for ( var workflowRunSWID in fprData['Project'][projectSWID]['Workflow Run'] ) {
		var date = new Date(fprData['Project'][projectSWID]['Workflow Run'][workflowRunSWID]['Last Modified']);
		if ( date <= dateTo && date >= dateFrom && typeof date !== 'undefined') {
			if (typeof returnObj[projectSWID]['Workflow Status'][fprData['Project'][projectSWID]['Workflow Run'][workflowRunSWID]['Status']] === 'undefined'){
				returnObj[projectSWID]['Workflow Status'][fprData['Project'][projectSWID]['Workflow Run'][workflowRunSWID]['Status']] = 1;
			} else {
				returnObj[projectSWID]['Workflow Status'][fprData['Project'][projectSWID]['Workflow Run'][workflowRunSWID]['Status']]++;
			}
		}
	}

	// Update in mongodb
	updateData('CurrentStatsByProject', projectSWID, returnObj);

	return returnObj;	
}

// returns the list of most recently modified projects in a specified date range
function getLastModifiedProjects (fprData, dateRange) {
	var returnObj = {};
	var dateTo = dateNow;
	var dateFrom = new Date().setDate(dateNow.getDate() - dateRange);
	
	for ( var projectSWID in fprData['Project'] ) {
		var date = new Date(fprData['Project'][projectSWID]['Last Modified']);
		if (date <= dateTo && date >= dateFrom && typeof date !== 'undefined') {
			returnObj[projectSWID] = {};
			returnObj[projectSWID]['Project Name'] = fprData['Project'][projectSWID]['Project Name'];
			returnObj[projectSWID]['Last Modified'] = getDateTimeString(fprData['Project'][projectSWID]['Last Modified']);
		}
	}

	returnObj['Date'] = getDateTimeString(dateNow);

	// Update in mongodb
	updateData('LastModifiedProjects', 'lastMod_' + dateRange + '_days', returnObj);

	return returnObj;
}

// returns list of start dates associated with each project
function getStartDateAllProjects (fprData) {
	var returnObj = {};
	
	for (var projectSWID in fprData['Project'] ) {
		returnObj[projectSWID] = {};
		returnObj[projectSWID]['Project Name'] = fprData['Project'][projectSWID]['Project Name'];
		if (typeof fprData['Project'][projectSWID]['Start Date'] !== 'undefined') {
			returnObj[projectSWID]['Start Date'] = fprData['Project'][projectSWID]['Start Date'];
		} else {
			// returns "Unspecified" if not found
			returnObj[projectSWID]['Start Date'] = "Unspecified";
		}
	}
	
	return returnObj;
}

// takes in dates from getStartDateAllProjects
function getStartDateByProject (dates, projectSWID) {
	var returnObj = {};
	returnObj[projectSWID] = dates[projectSWID];
	
	// Update in mongodb
	updateData('StartDateByProject', projectSWID, returnObj);

	return returnObj;
}

// for each project, returns workflow run analysis status (complete, failed, running, cancelled) based on type of workflow
function getAnalysisStatusAllProjects (fprData, dateRange, analysisYAML) {
	return getAnalysisStatusAllCategory('Project', fprData, dateRange, analysisYAML);
}

function getAnalysisStatusByProject (analysisCategories, projectSWID) {
	return getAnalysisStatusByCategory('Project', analysisCategories, projectSWID);
}

// returns the number of donors for each project
function getNumDonorsAllProjects (fprData) {
	var returnObj = {};
	
	for (var projectSWID in fprData['Project']) {
		returnObj[projectSWID] = {};
		returnObj[projectSWID]['Donors'] = {};
		returnObj[projectSWID]['Project Name'] = fprData['Project'][projectSWID]['Project Name'];
		for (var donor in fprData['Project'][projectSWID]['Donor Name']) {
			if (/^(.*?)_.*/.test(donor)) {
				var match = /^(.*?)_.*/.exec(donor);
				if (typeof returnObj[projectSWID]['Donors'][match[1]] === 'undefined') {
					returnObj[projectSWID]['Donors'][match[1]] = 1;
				} else {
					returnObj[projectSWID]['Donors'][match[1]]++;
				}
			}
		}
	}
	
	return returnObj;
}

// takes in num of donors from getNumDonorsAllProjects
function getNumDonorsByProject (donors, projectSWID) {
	var returnObj = {};
	returnObj[projectSWID] = donors[projectSWID];

	// Update in mongodb
	updateData('NumDonorsByProject', projectSWID, returnObj);

	return returnObj;
}

// returns the donors for a specified project SWID
function getDonorsByProject (fprData, projectSWID) {
	var returnObj = {};
	returnObj[projectSWID] = {};
	returnObj[projectSWID]['Project Name'] = fprData['Project'][projectSWID]['Project Name'];
	returnObj[projectSWID]['Donors'] = Object.keys(fprData['Project'][projectSWID]['Donor Name']);
	
	// Update in mongodb
	updateData('DonorsByProject', projectSWID, returnObj);

	return returnObj;
}

// returns the number of libraries for each project
function getNumLibrariesAllProjects (fprData) {
	var returnObj = {};
	
	for (var projectSWID in fprData['Project']) {
		returnObj[projectSWID] = {};
		returnObj[projectSWID]['Project Name'] = fprData['Project'][projectSWID]['Project Name'];
		for (var library in fprData['Project'][projectSWID]['Library Name']) {
			if (typeof returnObj[projectSWID]['Libraries'] === 'undefined') {
				returnObj[projectSWID]['Libraries'] = 1;
			} else {
				returnObj[projectSWID]['Libraries']++;
			}
		}
	}
	return returnObj;
}

// takes in num of libraries from getNumLibrariesByProject
function getNumLibrariesByProject (libraries, projectSWID) {
	var returnObj = {};
	returnObj[projectSWID] = libraries[projectSWID];

	// Update in mongodb
	updateData('NumLibrariesByProject', projectSWID, returnObj);

	return returnObj;
}

// returns the libraries for a specified project SWID
function getLibrariesByProject (fprData, projectSWID) {
	var returnObj = {};
	returnObj[projectSWID] = {};
	returnObj[projectSWID]['Project Name'] = fprData['Project'][projectSWID]['Project Name'];
	returnObj[projectSWID]['Libraries'] = Object.keys(fprData['Project'][projectSWID]['Library Name']);
	
	// Update in mongodb
	updateData('LibrariesByProject', projectSWID, returnObj);

	return returnObj;
}

// for each project, returns the donor and analysis status of workflows for each run, last modified date in specified time frame
function getRunDataAllProjects (fprData, dateFrom, dateTo, analysisYAML) {
	var returnObj = {};
	var dates = convertToDateObject(dateFrom, dateTo);
	dateFrom = dates[0];
	dateTo = dates[1];
	
	for (var projectSWID in fprData['Project']) {
		var date = new Date(fprData['Project'][projectSWID]['Last Modified'])
		if (date <= dateTo && date >= dateFrom && date !== 'undefined') {
			returnObj[projectSWID] = {};
			returnObj[projectSWID]['Run'] = {};
			returnObj[projectSWID]['Last Modified'] = getDateTimeString(fprData['Project'][projectSWID]['Last Modified']);
			returnObj[projectSWID]['Project Name'] = fprData['Project'][projectSWID]['Project Name'];
			for (var sequencerRunSWID in fprData['Project'][projectSWID]['Run']) {
				returnObj[projectSWID]['Run'][sequencerRunSWID] = {};
				returnObj[projectSWID]['Run'][sequencerRunSWID]['Donor'] = {};
				returnObj[projectSWID]['Run'][sequencerRunSWID]['Analysis Status'] = {};		
				returnObj[projectSWID]['Run'][sequencerRunSWID]['Run Name'] = fprData['Project'][projectSWID]['Run'][sequencerRunSWID]['Run Name'];
				// List of donors
				for (var donor in fprData['Project'][projectSWID]['Run'][sequencerRunSWID]['Donor Name']) {
					if (/^(.*?)_.*/.test(donor)) {
						var match = /^(.*?)_.*/.exec(donor);
						if (typeof returnObj[projectSWID]['Run'][sequencerRunSWID]['Donor'][match[1]] === 'undefined') {
							returnObj[projectSWID]['Run'][sequencerRunSWID]['Donor'][match[1]] = 1;
						} else {
							returnObj[projectSWID]['Run'][sequencerRunSWID]['Donor'][match[1]]++;
						}
					}
				}
				
				// List of analysis types and status count
				for (var workflowSWID in fprData['Project'][projectSWID]['Run'][sequencerRunSWID]['Workflow']) {
					for (var analysisType in analysisYAML) {
						if (typeof returnObj[projectSWID]['Run'][sequencerRunSWID]['Analysis Status'][analysisType] === 'undefined') {
							returnObj[projectSWID]['Run'][sequencerRunSWID]['Analysis Status'][analysisType] = {};
						}
						if (fprData['Project'][projectSWID]['Run'][sequencerRunSWID]['Workflow'][workflowSWID]['Workflow Name'] in analysisYAML[analysisType]) {
							if (typeof returnObj[projectSWID]['Run'][sequencerRunSWID]['Analysis Status'][analysisType][fprData['Project'][projectSWID]['Run'][sequencerRunSWID]['Workflow'][workflowSWID]['Status']] === 'undefined') {
								returnObj[projectSWID]['Run'][sequencerRunSWID]['Analysis Status'][analysisType][fprData['Project'][projectSWID]['Run'][sequencerRunSWID]['Workflow'][workflowSWID]['Status']] = 1;
							} else {
								returnObj[projectSWID]['Run'][sequencerRunSWID]['Analysis Status'][analysisType][fprData['Project'][projectSWID]['Run'][sequencerRunSWID]['Workflow'][workflowSWID]['Status']]++;
							}
						}
					}
				}
			}
		}
	}
	
	return returnObj;
}

// takes in run data from getRunDataAllProjects
function getRunDataByProject (runData, projectSWID) {
	var returnObj = {};
	returnObj[projectSWID] = runData[projectSWID];

	// Update in mongodb
	updateData('RunDataByProject', projectSWID, returnObj);

	return returnObj;
}

//// By Run
// for each run, returns a list of libraries and their SWID
function getLibrariesAllRuns (fprData) {
	var returnObj = {};
	
	for (var sequencerRunSWID in fprData['Run']) {
		returnObj[sequencerRunSWID] = {};
		returnObj[sequencerRunSWID]['Libraries'] = {};
		returnObj[sequencerRunSWID]['Run Name'] = fprData['Run'][sequencerRunSWID]['Run Name'];
		for (var library in fprData['Run'][sequencerRunSWID]['Library Name']) {
			returnObj[sequencerRunSWID]['Libraries'][library] = fprData['Run'][sequencerRunSWID]['Library Name'][library];
		}
	}
	
	return returnObj;
}

// takes in libraries from getLibrariesAllRuns
function getLibrariesByRun (libraries, runSWID) {
	var returnObj = {};
	returnObj[runSWID] = libraries[runSWID];

	// Update in mongodb
	updateData('LibrariesByRun', runSWID, returnObj);

	return returnObj;
}

//// By Donor
// for each donor, returns the external name, (TODO: institute), number of libraries per tissue type
function getDonorInfo (fprData) {
	var returnObj = {};
	var donors = getNumLibrariesPerTissueAllDonors(fprData);
	var status = getAnalysisStatusAllCategory ('Donor', fprData, null, analysisYAML);

	for (var donorSWID in fprData['Donor']) {
		// to remove duplicates (because multiple SWIDs for a donor)
		if (typeof returnObj[fprData['Donor'][donorSWID]['Donor Name']] === 'undefined') {
			returnObj[fprData['Donor'][donorSWID]['Donor Name']] = {};
			returnObj[fprData['Donor'][donorSWID]['Donor Name']]['External Name'] = {};
			returnObj[fprData['Donor'][donorSWID]['Donor Name']]['Tissue Types'] = {};
			returnObj[fprData['Donor'][donorSWID]['Donor Name']]['SWID'] = [];
		}
		// Determine donor external name
		if (/external_name.*=(.*?);/.test(fprData['Donor'][donorSWID]['Donor Attributes'])) {
			var match = /external_name.*=(.*?);/.exec(fprData['Donor'][donorSWID]['Donor Attributes']);
			returnObj[fprData['Donor'][donorSWID]['Donor Name']]['External Name'] = match[1];
		}
		// Only want running workflows
		for (var analysisType in analysisYAML) {
			if ('running' in status[donorSWID]['Analysis Status'][analysisType]) {
				returnObj[fprData['Donor'][donorSWID]['Donor Name']]['Analysis Status'] = {};
				returnObj[fprData['Donor'][donorSWID]['Donor Name']]['Analysis Status']['running'] = status[donorSWID]['Analysis Status'][analysisType]['running'];
			}
		}
		returnObj[fprData['Donor'][donorSWID]['Donor Name']]['Tissue Types'] = donors[fprData['Donor'][donorSWID]['Donor Name']]['Tissue'];
		// keep track of SWIDs for a donor
		returnObj[fprData['Donor'][donorSWID]['Donor Name']]['SWID'].push(donorSWID);
	}

	return returnObj;
}

// takes in data from getDonorInfo
function getDonorInfoByName (info, donor) {
	var returnObj = {};
	returnObj[donor] = info[donor];

	// Update in mongodb
	updateData('DonorInfo', donor, returnObj);

	return returnObj;
}

// returns number of libraries per tissue type for each donor
function getNumLibrariesPerTissueAllDonors (fprData) {
	var returnObj = {};
	
	// some multiple SWIDs per donor
	for (var donorSWID in fprData['Donor']) {
		if (typeof returnObj[fprData['Donor'][donorSWID]['Donor Name']] === 'undefined') {
			returnObj[fprData['Donor'][donorSWID]['Donor Name']] = {};
			returnObj[fprData['Donor'][donorSWID]['Donor Name']]['SWID'] = [];
			returnObj[fprData['Donor'][donorSWID]['Donor Name']]['Tissue'] = {};
		}
		for (var tissue in fprData['Donor'][donorSWID]['Tissue Type']) {
			if (typeof returnObj[fprData['Donor'][donorSWID]['Donor Name']][tissue] === 'undefined') {
				returnObj[fprData['Donor'][donorSWID]['Donor Name']]['Tissue'][tissue] = [];
			}
			for (var library in fprData['Donor'][donorSWID]['Tissue Type'][tissue]['Library']) {
				returnObj[fprData['Donor'][donorSWID]['Donor Name']]['Tissue'][tissue].push(library);
			}
		}
		returnObj[fprData['Donor'][donorSWID]['Donor Name']]['SWID'].push(donorSWID);
	}
	// remove duplicates and return number of libraries per tissue
	for (var donor in returnObj) {
		for (var tissue in returnObj[donor]['Tissue']) {
			returnObj[donor]['Tissue'][tissue] = _.uniq(returnObj[donor]['Tissue'][tissue]).length;
		}
	}
	
	return returnObj;
}

// takes in num of libraries from getNumLibrariesPerTissueAllDonors
function getNumLibrariesPerTissueByDonor (libraries, donor) {
	var returnObj = {};
	returnObj[donor] = libraries[donor];

	// Update in mongodb
	updateData('NumLibrariesPerTissueByDonor', donor, returnObj);

	return returnObj;
}

// returns number of library type for each donor
function getNumOfLibraryTypeAllDonors (fprData) {
	var returnObj = {};
	var temp = {};

	// Load libraries per donor into temp object
	for (var donorSWID in fprData['Donor']) {
		if (typeof returnObj[fprData['Donor'][donorSWID]['Donor Name']] === 'undefined') {
			returnObj[fprData['Donor'][donorSWID]['Donor Name']] = {};
			returnObj[fprData['Donor'][donorSWID]['Donor Name']]['Library Type'] = {};
			returnObj[fprData['Donor'][donorSWID]['Donor Name']]['SWID'] = [];
			temp[fprData['Donor'][donorSWID]['Donor Name']] = {};
			temp[fprData['Donor'][donorSWID]['Donor Name']]['Libraries'] = [];
		}
		for (var tissue in fprData['Donor'][donorSWID]['Tissue Type']){
			for (var library in fprData['Donor'][donorSWID]['Tissue Type'][tissue]['Library']) {
				temp[fprData['Donor'][donorSWID]['Donor Name']]['Libraries'].push(library);
			}
		}
		returnObj[fprData['Donor'][donorSWID]['Donor Name']]['SWID'].push(donorSWID);
	}
	
	for (var donor in temp) {
		// Remove duplicates
		temp[donor]['Libraries'] = _.uniq(temp[donor]['Libraries']);
		// Count number of library types (last token of library name)
		for (var i = 0; i < temp[donor]['Libraries'].length; i++){
			if (/.*_(.*?)$/.test(temp[donor]['Libraries'][i])) {
				var match = /.*_(.*?)$/.exec(temp[donor]['Libraries'][i]);
				// Some libraries end with a digit (not a library type)
				if (/\D*/.test(match[1])) {
					if (typeof returnObj[donor]['Library Type'][match[1]] === 'undefined') {
						returnObj[donor]['Library Type'][match[1]] = 1;
					} else {
						returnObj[donor]['Library Type'][match[1]]++;
					}
				}
			}
		}
	}

	return returnObj;
}

//takes in num of library types from getNumOfLibraryTypeAllDonors
function getNumOfLibraryTypeByDonor (numLibTypes, donor) {
	var returnObj = {};
	returnObj[donor] = numLibTypes[donor];

	// Update in mongodb
	updateData('NumOfLibraryTypeByDonor', donor, returnObj);
	return returnObj;
}

// for each donor, returns the start date (date received) and end date (complete analysis)
function getStartEndDateAllDonors (fprData) {
	var returnObj = {};

	for (var donorSWID in fprData['Donor']){
		if (typeof returnObj[fprData['Donor'][donorSWID]['Donor Name']] === 'undefined') {
			returnObj[fprData['Donor'][donorSWID]['Donor Name']] = {};
			returnObj[fprData['Donor'][donorSWID]['Donor Name']]['SWID'] = [];
		}
		returnObj[fprData['Donor'][donorSWID]['Donor Name']]['SWID'].push(donorSWID);
		returnObj[fprData['Donor'][donorSWID]['Donor Name']]['End Date'] = getDateTimeString(fprData['Donor'][donorSWID]['Last Modified']);
		if (/receive_date.*?=(.*?);/.test(fprData['Donor'][donorSWID]['Donor Attributes'])) {
			var match = /receive_date.*?=(.*?);/.exec(fprData['Donor'][donorSWID]['Donor Attributes']);
			if (typeof returnObj[fprData['Donor'][donorSWID]['Donor Name']]['Start Date'] === 'undefined') {
				returnObj[fprData['Donor'][donorSWID]['Donor Name']]['Start Date'] = match[1];
			}
		} else { 
			// If donor attribute doesn't contain start date, state "Unspecified"
			if (typeof returnObj[fprData['Donor'][donorSWID]['Donor Name']]['Start Date'] === 'undefined') {
				returnObj[fprData['Donor'][donorSWID]['Donor Name']]['Start Date'] = "Unspecified";
			}
		}
	}

	return returnObj;
}

// takes in dates from getStartEndDateAllDonors
function getStartEndDateByDonor (dates, donor) {
	var returnObj = {};
	returnObj[donor] = dates[donor];

	// Update in mongodb
	updateData('StartEndDateByDonor', donor, returnObj);
	return returnObj;
}

// returns all instruments associated with each donor
function getInstrumentNamesAllDonors (fprData) {
	var returnObj = {};

	for (var donorSWID in fprData['Donor']) {
		if (typeof returnObj[fprData['Donor'][donorSWID]['Donor Name']] === 'undefined') {
			returnObj[fprData['Donor'][donorSWID]['Donor Name']] = {};
			returnObj[fprData['Donor'][donorSWID]['Donor Name']]['Instruments'] = [];
			returnObj[fprData['Donor'][donorSWID]['Donor Name']]['SWID'] = [];
		}		
		for (var sequencerRunSWID in fprData['Donor'][donorSWID]['Run']) {
			if(/.*?_(.*?)_.*/.test(fprData['Donor'][donorSWID]['Run'][sequencerRunSWID]['Run Name'])) {
				var match = /.*?_(.*?)_.*/.exec(fprData['Donor'][donorSWID]['Run'][sequencerRunSWID]['Run Name']);
				match[1] = match[1].replace(/SN700/, "h");
				match[1] = match[1].replace(/SN/, "h");
				match[1] = match[1].replace(/I/, "i");
				returnObj[fprData['Donor'][donorSWID]['Donor Name']]['Instruments'].push(match[1]);
			}
		}
		returnObj[fprData['Donor'][donorSWID]['Donor Name']]['SWID'].push(donorSWID);
	}
	for (var donor in returnObj) {
		returnObj[donor]['Instruments'] = _.uniq(returnObj[donor]['Instruments']);
	}

	return returnObj;
}

// takes in instruments from getInstrumentNamesAllDonors
function getInstrumentNamesByDonor (instruments, donor) {
	var returnObj = {};
	returnObj[donor] = instruments[donor];

	//Update in mongodb
	updateData('InstrumentNamesByDonor', donor, returnObj);
	return returnObj;
}

//// By Library
// for each library, returns workflow run analysis status (complete, failed, running, cancelled) based on type of workflow
function getAnalysisStatusAllLibraries (fprData, dateRange, analysisYAML) {
	return getAnalysisStatusAllCategory('Library', fprData, dateRange, analysisYAML);
}

function getAnalysisStatusByLibrary (analysisCategories, sampleSWID) {
	return getAnalysisStatusByCategory('Library', analysisCategories, sampleSWID);
}

// for each library, returns the library types, tissue types, tissue origins
function getLibraryInfo (fprData) {
	var returnObj = {};

	for (var sampleSWID in fprData['Library']) {
		returnObj[sampleSWID] = {};
		returnObj[sampleSWID]['Library Name'] = fprData['Library'][sampleSWID]['Library Name'];
		if (/library_source_template_type=(.*?)?/.test(fprData['Library'][sampleSWID]['Sample Attributes'])) {
			var match = /library_source_template_type=(.*?);/.exec(fprData['Library'][sampleSWID]['Sample Attributes']);
			returnObj[sampleSWID]['Library Type'] = match[1];
		}
		if (/tissue_type=(.*?)?/.test(fprData['Library'][sampleSWID]['Sample Attributes'])) {
			var match = /tissue_type=(.*?)?/.exec(fprData['Library'][sampleSWID]['Sample Attributes']);
			returnObj[sampleSWID]['Tissue Type'] = match[1];
		}
		if (/tissue_origin=(.*?);/.test(fprData['Library'][sampleSWID]['Sample Attributes'])) {
			var match = /tissue_origin=(.*?);/.exec(fprData['Library'][sampleSWID]['Sample Attributes']);
			returnObj[sampleSWID]['Tissue Origin'] = match[1];
		}
	}

	return returnObj;
}

function getLibraryInfoBySWID (libraryInfo, sampleSWID) {
	var returnObj = {};
	returnObj[sampleSWID] = libraryInfo[sampleSWID];

	// Update in mongodb
	updateData('LibraryInfo', sampleSWID, returnObj);

	return returnObj;
}

// for each library, returns the workflow details such as name, skip, end date, and file paths
function getWorkflowAllLibraries (fprData) {
	var returnObj = {};

	for (var sampleSWID in fprData['Library']) {
		returnObj[sampleSWID] = {};
		returnObj[sampleSWID]['Library Name'] = fprData['Library'][sampleSWID]['Library Name'];
		for (var workflowSWID in fprData['Library'][sampleSWID]['Workflow Run']) {
			returnObj[sampleSWID]['Workflow Run'] = {};
			returnObj[sampleSWID]['Workflow Run'][workflowSWID] = {};
			returnObj[sampleSWID]['Workflow Run'][workflowSWID]['File Paths'] = [];
			returnObj[sampleSWID]['Workflow Run'][workflowSWID]['Workflow Name'] = fprData['Library'][sampleSWID]['Workflow Run'][workflowSWID]['Workflow Name'];
			returnObj[sampleSWID]['Workflow Run'][workflowSWID]['Skip'] = fprData['Library'][sampleSWID]['Workflow Run'][workflowSWID]['Skip'];
			returnObj[sampleSWID]['Workflow Run'][workflowSWID]['End Date'] = getDateTimeString(fprData['Library'][sampleSWID]['Workflow Run'][workflowSWID]['Last Modified']);
			for (var fileSWID in fprData['Library'][sampleSWID]['Workflow Run'][workflowSWID]['Files']) {
				returnObj[sampleSWID]['Workflow Run'][workflowSWID]['File Paths'].push(fprData['Library'][sampleSWID]['Workflow Run'][workflowSWID]['Files'][fileSWID]);
			}
		}
	}

	return returnObj;
}

function getWorkflowByLibrary (workflows, sampleSWID) {
	var returnObj = {};
	returnObj[sampleSWID] = workflows[sampleSWID];

	//Update in mongodb
	updateData('WorkflowByLibrary', sampleSWID, returnObj);

	return returnObj;
}

//// Reporting Functions (detailed pages)
// Returns associated JSON file per library per lane per donor
function getJSONFilesByLibraryByLaneAllDonors(fprData) {
	var files = {};

	for (var donorSWID in fprData['Donor']) {
		var donor = fprData['Donor'][donorSWID]['Donor Name'];
		if (typeof files[donor] === 'undefined') {
			files[donor] = {};
			files[donor]['SWID'] = [];
		}
		files[donor]['SWID'].push(donorSWID);
		if (typeof fprData['Donor'][donorSWID]['Lane'] !== 'undefined') {
			for (var lane in fprData['Donor'][donorSWID]['Lane']) {
				if (typeof files[donor]['Lane'] === 'undefined') {
					files[donor]['Lane'] = {};
				}
				if (typeof files[donor]['Lane'][lane] === 'undefined') {
					files[donor]['Lane'][lane] = {};
				}
				for (var library in fprData['Donor'][donorSWID]['Lane'][lane]['Library']) {
					files[donor]['Lane'][lane][library] = fprData['Donor'][donorSWID]['Lane'][lane]['Library'][library]['JSON'];
				}
				_.uniq(files[donor]['Lane'][lane][library]);
			}
		}
	}
	return files; //returns all JSON files associated by library-lane-donor
}

// Takes in files returned by getJSONFilesByLibraryByLaneAllDonors and gets Report Data for one specified (donor, lane, library)
function getReportDataByLibraryByLaneByDonor(JSONfiles, donor, lane, library) {
	var json = JSONfiles[donor]['Lane'][lane][library];
	var returnObj = {};
	returnObj['Donor'] = {};
	returnObj['Donor'][donor] = {};
	returnObj['Donor'][donor]['Lane'] = {};
	returnObj['Donor'][donor]['Lane'][lane] = {};
	returnObj['Donor'][donor]['Lane'][lane]['Library'] = {};
	returnObj['Donor'][donor]['Lane'][lane]['Library'][library] = {};

	returnObj['Donor'][donor]['Lane'][lane]['Library'][library] = getReportData(json, returnObj['Donor'][donor]['Lane'][lane]['Library'][library]);

	// Update in mongodb
	//updateData('ReportDataByLibraryByLaneByDonor', donor + '_' + lane + '_' + library, returnObj);

	return returnObj;
}

// Returns associated JSON file per library per lane per run
function getReportDataByLibraryByLaneByRun(fprData, runSWID, lane, library) {
	var json = fprData['Run'][runSWID]['Lane'][lane]['Library'][library]['JSON'];
	var xenomeFile = fprData['Run'][runSWID]['Lane'][lane]['Library'][library]['XenomeFile'];
	var returnObj = {};
	returnObj['Run'] = {};
	returnObj['Run'][fprData['Run'][runSWID]['Run Name']] = {};
	returnObj['Run'][fprData['Run'][runSWID]['Run Name']]['Lane'] = {};
	returnObj['Run'][fprData['Run'][runSWID]['Run Name']]['Lane'][lane] = {};
	returnObj['Run'][fprData['Run'][runSWID]['Run Name']]['Lane'][lane]['Library'] = {};
	returnObj['Run'][fprData['Run'][runSWID]['Run Name']]['Lane'][lane]['Library'][library] = {};

	returnObj['Run'][fprData['Run'][runSWID]['Run Name']]['Lane'][lane]['Library'][library] = getReportData(json, xenomeFile, returnObj['Run'][fprData['Run'][runSWID]['Run Name']]['Lane'][lane]['Library'][library]);
	
	//Update in mongodb
	//updateData('ReportDataByLibraryByLaneByRun', fprData['Run'][runSWID]['Run Name'] + '_' + lane + '_' + library, returnObj);

	return returnObj;
}

function getRNASeqQCData(zipFile) {
	var zip = new AdmZip(zipFile);
	//var zip = new AdmZip('./SWID_3011599_PCSI_0326_Pa_P_PE_328_MR_526_151112_D00331_0145_AC859WANXX_CAGATC_L006_R1_001_rnaqc.report.zip');
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
	obj['Total Reads (including unaligned)'] = TOTAL_READS;
	obj['Uniq Reads'] = UNIQ_READS;
	if (START_POINTS != 0) {
		obj['Reads Per Start Point'] = (UNIQ_READS/START_POINTS).toFixed(2);
	} else {
		obj['Reads Per Start point'] = '#Start Points Job Failed -> rerun!'
	}
	obj['Passed Filter Bases'] = PF_BASES;
	obj['Passed Filter Aligned Bases'] = PF_ALIGNED_BASES;
	obj['Coding Bases'] = CODING_BASES;
	obj['UTR Bases'] = UTR_BASES;
	obj['Intronic Bases'] = INTRONIC_BASES;
	obj['Intergenic Bases'] = INTERGENIC_BASES;
	if (CORRECT_STRAND_READS != 0) {
		obj['Correct Strand Reads'] = CORRECT_STRAND_READS;
	} else {
		obj['Correct Strand Reads'] = 'Not a Strand Specific Library';
	}
	if (INCORRECT_STRAND_READS != 0) {
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
	if (PCT_CORRECT_STRAND_READS != 0) {
		obj['Proportion Correct Strand Reads'] = PCT_CORRECT_STRAND_READS;
	} else {
		obj['Proportion Correct Strand Reads'] = 'Not a Strand Specific Library';
	}
	obj['Median CV Coverage'] = MEDIAN_CV_COVERAGE;
	obj['Median 5Prime Bias'] = MEDIAN_5PRIME_BIAS;
	obj['Median 3Prime Bias'] = MEDIAN_3PRIME_BIAS;
	obj['Median 5Prime to 3Prime Bias'] = MEDIAN_5PRIME_TO_3PRIME_BIAS;
	if (TOTAL_READS != 0) {
		obj['rRNA Contamination (%reads aligned)'] = ((RIBOSOMAL_READS/TOTAL_READS)*100).toFixed(2);
	} else {
		obj['rRNA Contamination (%reads algined)'] = 'Total Reads Job Failed -> re-run report';
	}
	return obj;
}
//var obj = {};
//obj = getRNASeqQCData('/oicr/data/archive/seqware/seqware_analysis_8/hsqwprod/seqware-results/RNAseqQc_2.3/92922100/140926_SN802_0204_AC5JLPACXX_ERNA_0041_nn_C_PE_398_WT_rnaqc.report.zip');

function getRNASeqQCDataByLibraryByRun(fprData, runSWID, library) {
	var returnObj = {};
	returnObj['Run'] = {};
	returnObj['Run'][fprData['Run'][runSWID]['Run Name']] = {};
	returnObj['Run'][fprData['Run'][runSWID]['Run Name']]['Library'] = {};
	returnObj['Run'][fprData['Run'][runSWID]['Run Name']]['Library'][library] = getRNASeqQCData(fprData['Run'][runSWID]['Library'][library]['RNAZipFile']);
	
	//Update in mongodb
	//updateData('RNASeqQCDataByLibraryByRun', fprData['Run'][runSWID]['Run Name'] + '_' + library, returnObj);
	return returnObj;
}

function getReportData(jsonFile, xenomeFile, obj) {
	if (typeof jsonFile !== 'undefined') {
		var jsonString = fs.readFileSync(jsonFile, 'utf8'); 
		var lineObj = JSON.parse(jsonString);

		// Initialize
		var readsSP = parseFloat(lineObj['reads per start point']).toFixed(2);
		var onTargetRate = lineObj['reads on target']/lineObj['mapped reads'];

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
			obj['Raw Reads'] = rawReads;
			obj['Raw Yield'] = parseInt(rawReads*lineObj['average read length']);
		} else {
			obj['Map %'] = 0;
			obj['Raw Reads'] = 0;
			obj['Raw Yield'] = 0;
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

function generateGraphsByLibraryByLaneByDonor(json, donor, lane, library) {
	var jsonString = fs.readFileSync(json, 'utf8');
	var lineObj = JSON.parse(jsonString);
	var label = lineObj['run name'] + ' Lane: ' + lineObj['lane'] + ' Barcode: ' + lineObj['barcode'] + '\n' + lineObj['library'];

	// pie chart - read breakdown
	var pieReadData = [];
	var pieArray = [];
	var colors = ['#878BB6', '#4ACAB4', '#FF8153', '#FFEA88'];
	var labels = ['on target', 'off target', 'repeat/low quality', 'unmapped'];
	pieArray.push(lineObj['mapped reads']);
	pieArray.push(parseInt(lineObj['mapped reads']) - parseInt(lineObj['reads on target']));
	pieArray.push(lineObj['qual fail reads']);
	pieArray.push(lineObj['unmapped reads']);
	total = lineObj['mapped reads'] + (parseInt(lineObj['mapped reads']) - parseInt(lineObj['reads on target'])) + lineObj['qual fail reads'] + lineObj['unmapped reads'];

	var readBreakdownData = {
        chart: {
        	borderColor: '#3a3a3a',
            borderWidth: 1,
            plotShadow: true,
            type: 'pie'
        },
        title: {
            text: label + ' Read Breakdown'
        },
        tooltip: {
        	pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
        	pie: {
        		allowPointSelect: true,
        		cursor: 'pointer',
        		dataLabels: {
        			enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }        			
        		}
        	}
        },
        series: [{
            name: 'Read Breakdown',
            colorByPoint: true,
            data: []
        }],
    };
	for (var i = 0; i < pieArray.length; i++) {
		var obj = {};
		obj['name'] = labels[i];
		obj['y'] = pieArray[i]/total;
		readBreakdownData.series[0].data.push(obj);
	}

	// line chart - insert distribution
	var xValInsert = [];
	var yValInsert = [];
	var insertColors = {};
	var red = 'rgb(255, 102, 102)';
	var yellow = 'rgb(255, 255, 102)';
	var green = 'rgb(179, 255, 102)';
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
	if ((xValInsert[0] < (insertMean - (2 * insertStep))) || (xValInsert[0] > (insertMean + (2 * insertStep)))) {
		var iColor = red;
	} else if ((xValInsert[0] < (insertMean - insertStep)) || (xValInsert[0] > (insertMean + insertStep))) {
		var iColor = yellow;
	} else {
		var iColor = green
	}
	for (var i = 1; i < xValInsert.length; i++) {
		xValInsert[i] = parseInt(xValInsert[i]);
		if ((xValInsert[i] < (insertMean - (2 * insertStep))) || (xValInsert[i] > (insertMean + (2 * insertStep)))) {
			var color = red;
		} else if ((xValInsert[i] < (insertMean - insertStep)) || (xValInsert[i] > (insertMean + insertStep))){
			var color = yellow;
		} else {
			var color = green;
		}
		if (color !== iColor) {
			insertColors[i] = iColor;
			iColor = color;
		}
		if (i == xValInsert.length - 1) {
			insertColors[i] = iColor;
		}
	}
	var zones = [];
	for (var value in insertColors) {
		var obj = {};
		obj['value'] = value;
		obj['fillColor'] = insertColors[value];
		obj['color'] = insertColors[value];
		zones.push(obj);
	}
	var insertDistributionData = {
		chart: {
			borderColor: '#3a3a3a',
            borderWidth: 1,
			type: 'area'
		},
        title: {
            text: label + ' Insert Distribution',
            x: -20 //center
        },
        plotOptions: {
        	area:{
        		pointStart: 0
        	}
        },
        legend: {
        	enabled: false
        },
        xAxis: {
        	title: {
        		text: 'Insert Size (bp)'
        	},
        	tickInterval: 50
            //categories: xValInsert
        },
        yAxis: {
            title: {
                text: 'Pairs'
            }
        },
        tooltip: {
            valueSuffix: ' bp'
        },
        series: [{
            name: 'Insert Distribution',
            zoneAxis: 'x',
        	zones: zones,
            data: yValInsert

        }]
    };

	// bar chart - soft clip by cycle
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
	var xValSoft = [];
	var yValSoft = [];
	var read1max = 0;

	for (var i = 0; i < readArray.length; i++) {
		if (typeof lineObj[readArray[i] + ' soft clip by cycle'] !== 'undefined') {
			var errorObj = lineObj[readArray[i] + ' soft clip by cycle'];
			for (var j in errorObj) {
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

	var softClipData = {
		chart: {
			borderColor: '#3a3a3a',
            borderWidth: 1,
			type: 'area'
		},
        title: {
            text: label + ' Soft Clips by Cycle',
            x: -20 //center
        },
        plotOptions: {
        	area:{
        		pointStart: 0
        	}
        },
        legend: {
        	enabled: false
        },
        xAxis: {
        	title: {
        		text: 'Cycles', 
        	},
        	min: 0,
        	startOnTick: true,
        	tickInterval: 50,
            //categories: xValSoft
        },
        yAxis: {
            title: {
                text: '% Bases Soft Clipped'
            },
            max: 100
        },
        series: [{
            name: 'Soft Clips By Cycle',
            data: yValSoft,
            color: 'rgb(255, 102, 102)',
            fillColor: 'rgb(255, 102, 102)'
        }]
	};

	// Output to html
	fs.readFile('./graphTest.html', 'utf8', function (err, data) {
		if (err) return console.error(err);
		http.createServer(function (request, response) {
			response.writeHead(200, {'Content-Type': 'text/html'});
		    data = data.replace('{{readBreakdownData}}', JSON.stringify(readBreakdownData));
		    data = data.replace('{{insertDistributionData}}', JSON.stringify(insertDistributionData));
		    data = data.replace('{{softClipData}}', JSON.stringify(softClipData));
		    response.write(data);
		    response.end();
	    }).listen(8081);
	});

	console.log('Server running at http://127.0.0.1:8081/');
}

//getMouseData('SWID_1506799_PCSI_0322_Pa_X_PE_611_WG_526_150226_D00331_0124_AC6DP5ANXX_NoIndex_L007.log');
//Test graph
//generateGraphsByLibraryByLaneByDonor('SWID_3165537_PV_0001_Bm_P_PE_423_EX_3_151216_D00331_0149_AC8L3CANXX_AACGTGAT_L001_R1_001.annotated.bam.BamQC.json');
//generateGraphsByLibraryByLaneByDonor('SWID_3574804_PCSI_0633_Ly_R_PE_667_WG_160209_D00353_0127_AC8T56ANXX_CCGTCC_L006_R1_001.annotated.bam.BamQC.json');

//// General Analysis Status
// general template to get workflow run analysis status based on category (either project or library)
function getAnalysisStatusAllCategory(category, fprData, dateRange, analysisYAML) {
	var returnObj = {};
	if (dateRange === null) {
		var dates = convertToDateObject('', '');
		var dateFrom = dates[0];
		var dateTo = dates[1];
	} else {
		var dateTo = dateNow;
		var dateFrom = new Date().setDate(dateNow.getDate() - dateRange);
	}
	for (var SWID in fprData[category]) {
		var date = new Date(fprData[category][SWID]['Last Modified']);
		if (date <= dateTo && date >= dateFrom && date !== 'undefined') {
			returnObj[SWID] = {};
			returnObj[SWID]['Workflow Runs'] = [];
			returnObj[SWID]['Analysis Status'] = {};
			returnObj[SWID][category + ' Name'] = fprData[category][SWID][category + " Name"];
			returnObj[SWID]['Last Modified'] = getDateTimeString(fprData[category][SWID]['Last Modified']);
			for (var workflowSWID in fprData[category][SWID]['Workflow Run']){
				returnObj[SWID]['Workflow Runs'].push(fprData[category][SWID]['Workflow Run'][workflowSWID]['Workflow Name']);
				for (var analysisType in analysisYAML) {
					if (typeof returnObj[SWID]['Analysis Status'][analysisType] === 'undefined') {
						returnObj[SWID]['Analysis Status'][analysisType] = {};
					}
					// for each workflow, check which analysis type it is and increment count by 1
					if (fprData[category][SWID]['Workflow Run'][workflowSWID]['Workflow Name'] in analysisYAML[analysisType]) {
						if (typeof returnObj[SWID]['Analysis Status'][analysisType][fprData[category][SWID]['Workflow Run'][workflowSWID]['Status']] === 'undefined') {
							returnObj[SWID]['Analysis Status'][analysisType][fprData[category][SWID]['Workflow Run'][workflowSWID]['Status']] = 1;
						} else {
							returnObj[SWID]['Analysis Status'][analysisType][fprData[category][SWID]['Workflow Run'][workflowSWID]['Status']]++;
						}
					}
				}
			}
			returnObj[SWID]['Workflow Runs'] = _.uniq(returnObj[SWID]['Workflow Runs']);
		}
	}

	return returnObj;
}

// takes in returned object from getAnalysisStatusAllCategory
function getAnalysisStatusByCategory(category, analysisCategories, SWID) {
	var returnObj = {};
	returnObj[SWID] = analysisCategories[SWID];

	// Update in mongodb
	updateData('AnalysisStatusBy' + category, SWID, returnObj);

	return returnObj;
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

// for functions with input dates, converts date strings to objects for comparision
function convertToDateObject(dateFrom, dateTo) {
	if (dateFrom === '' && dateTo === ''){
		dateFrom = new Date('1970-01-01 00:00:00');
		dateTo = dateNow;
	} else if ((dateFrom) !== (dateTo)) {
		if (dateFrom === ''){
			dateFrom = new Date('1970-01-01 00:00:00');
			dateTo = new Date(dateTo);
		} else {
			dateTo = dateNow;
			dateFrom = new Date(dateFrom);
		}
	}
	return [dateFrom, dateTo];
}

// updates provided info in mongodb
function updateData(collection, id, data) {
	// set the collection entry _id to the SWID/name of entry
	data['_id'] = id;

	MongoClient.connect(url, function(err, db) {
		if (err) return console.error(err);
		console.log('connected');

		// Return updated info, insert if not already in db
		db.collection(collection).updateOne({_id: data['_id']}, data, {upsert: true}, function (err) {
			if (err) return console.error(err);
			db.close();
		});
	});
}
