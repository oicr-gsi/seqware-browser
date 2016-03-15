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
	obj = getSeqWareStatsAllDates(fprData);

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

	//var status = getAnalysisStatusAllProjects(fprDataProject, null, analysisYAML);
	//var numDonors = getNumDonorsAllProjects(fprDataProject);
	//var runData = getRunDataAllProjects(fprDataProject, '', '', analysisYAML);
	//updateProjectAcronym(fprDataProject);
	for (var projectSWID in fprDataProject['Project']) {
		//getCurrentStatsByProject(fprDataProject, new Date().setDate(dateNow.getDate() - 7), '', projectSWID);
		//getAnalysisStatusByProject(status, projectSWID);
		//updateNumDonorsByProject(numDonors, projectSWID);
		//updateDonorsByProject(fprDataProject, projectSWID);
		//updateLibrariesByProject(fprDataProject, projectSWID);
		//updateRunDataByProject(runData, projectSWID);
	}
	
	if (typeof obj !== 'undefined') {
		obj = JSON.stringify(obj);
		console.log(obj);
	}
});
/*
// read fpr-Run JSON
fs.readFile(process.argv[5], 'utf8', function(err, data){
	if (err) return console.error(err);
	//console.log("starting run");
	fprDataRun = JSON.parse(data);

	// functions associated with run key
	var obj;
	//var runInfo = getRunInfo(fprDataRun);
	updateLibrariesPerLaneByRun(fprDataRun);
	for (var runSWID in fprDataRun['Run']) {
		//updateRunInfoBySWID(runInfo, runSWID);
		/*
		if (typeof fprDataRun['Run'][runSWID]['Lane'] !== 'undefined') {
			for (var lane in fprDataRun['Run'][runSWID]['Lane']) {
				for (var library in fprDataRun['Run'][runSWID]['Lane'][lane]['Library']) {
					//obj = getReportDataByLibraryByLaneByRun(fprDataRun, runSWID, lane, library);
					//obj = JSON.stringify(obj);
					//console.log(obj);
					if (typeof fprDataRun['Run'][runSWID]['Lane'][lane]['Library'][library]['JSON'] !== 'undefined'){
						obj = generateGraphDataByJSON(fprDataRun['Run'][runSWID]['Lane'][lane]['Library'][library]['JSON']);
						obj = JSON.stringify(obj);
						console.log(obj);
					}
				}
			}
		}
		
	}
	
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
	var donorInfo = getDonorInfo(fprDataDonor);
	//var numLibraries = getNumLibrariesPerTissueAllDonors(fprDataDonor);
	//var numLibTypes = getNumOfLibraryTypeAllDonors(fprDataDonor);
	//var dates = getStartEndDateAllDonors(fprDataDonor);
	//var instruments = getInstrumentNamesAllDonors(fprDataDonor);

	for (var i = 0; i < donors.length; i++){
		updateDonorInfoByName(donorInfo, donors[i]);
		//getNumLibrariesPerTissueByDonor(numLibraries, donors[i]);
		//getNumOfLibraryTypeByDonor(numLibTypes, donors[i]);
		//updateStartEndDateByDonor(dates, donors[i]);
		//getInstrumentNamesByDonor(instruments, donors[i]);
	}

	if (typeof obj !== 'undefined') {
		obj = JSON.stringify(obj);
		//console.log(obj);
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
	//var workflows = getWorkflowAllLibraries(fprDataLibrary, analysisYAML);
	//updateWorkflowStatusLibrariesAllDates(fprDataLibrary);
	//updateReportDataByLibrary(fprDataLibrary);
	//updateRNASeqQCDataByLibrary(fprDataLibrary);
	updateLaneDetailsTotalsByRun(fprDataLibrary);
	for (var IUSSWID in fprDataLibrary['Library']) {
		//updateAnalysisStatusByLibrary(status, IUSSWID);
		//updateLibraryInfoBySWID(libraryInfo, IUSSWID);
		//updateWorkflowByLibrary(workflows, IUSSWID);

	}

	if (typeof obj !== 'undefined') {
		obj = JSON.stringify(obj);
		console.log(obj);
	}
});
*/
// num of completed workflows and libraries by run (requires fprDataRun and fprDataLibrary)
readMultipleFiles([process.argv[5], process.argv[6]], 'utf8', function (err, data) {
	if (err) return console.error(err);
	console.log("starting run-library");

	fprDataRun = JSON.parse(data[0]);
	fprDataLibrary = JSON.parse(data[1]);

	updateNumCompletedWorkflowsForRunByDate(fprDataRun, fprDataLibrary);

});
/*
// read pinery output files
readMultipleFiles([process.argv[8], process.argv[9], process.argv[10], process.argv[11]], 'utf8', function(err, data){
	if (err) return console.error(err);
	console.log("starting pinery files");
	sequencerData = JSON.parse(data[0])
	instData = JSON.parse(data[1]);
	sampleData = JSON.parse(data[2]);
	projectData = JSON.parse(data[3]);

	var obj;
	//obj = getInstrumentIDs(instData);
	//updatePipelineStatus(sequencerData, sampleData);
	//obj = updateStartDateAllRuns(sequencerData);
	//obj = updateStartDateAllProjects(projectData);
	//updateSequencingStatusAllLibraries(sequencerData, sampleData);
	updateExternalNameAndInstituteAllDonors(sampleData);

	if (typeof obj !== 'undefined') {
		obj = JSON.stringify(obj);
		console.log(obj);
	}
});

// can only run getReportData in the cluster sinces files are in the cluster, 
// return json file and parse it back into mongo using this func
fs.readFile(process.argv[12], 'utf8', function(err, data) {
	if (err) return console.error(err);
	console.log('connected');
	var lines = data.toString().split('\n');
	console.log(lines.length);
	/*
	for (var i = 0; i < lines.length - 1; i++){
		reportData = JSON.parse(lines[i]);
		for (var key in reportData) {
			updateData('ReportDataByLibrary', key, reportData);
		}
	}
	
	for (var i = 0; i < lines.length - 1; i++) {
		graphData = JSON.parse(lines[i]);
		for (var id in graphData) {
			updateData('GraphData', id, graphData);
		}
	}
	
	for (var i = 0; i < lines.length - 1; i++){
		reportData = JSON.parse(lines[i]);
		for (var IUSSWID in reportData) {
			updateData('RNASeqQCDataByLibrary', IUSSWID, reportData);
		}
	}
	
});
*/
// read YAML containing info on workflows and their analysis type
fs.readFile(process.argv[2], 'utf8', function(err, data){
	if (err) return console.error(err);
	console.log("reading yaml");
	analysisYAML = YAML.parse(data);
	//console.log(analysisYAML);
});
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
	returnObj[projectSWID]['Project Libraries'] = Object.keys(fprData['Project'][projectSWID]['Library']).length;

	var dates = convertToDateObject(dateFrom, dateTo);
	dateFrom = dates[0];
	dateTo = dates[1];

	if (dateFrom === '') {
		returnObj[projectSWID]['Date From'] = 'Unspecified';
	} else {
		returnObj[projectSWID]['Date From'] = getDateTimeString(dateFrom);
	}
	if (dateTo === '' ) {
		returnObj[projectSWID]['Date To'] = getDateTimeString(dateNow);
	} else {
		returnObj[projectSWID]['Date To'] = getDateTimeString(dateTo);
	}

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

// for each project, returns workflow run analysis status (complete, failed, running, cancelled) based on type of workflow
function getAnalysisStatusAllProjects (fprData, dateRange, analysisYAML) {
	return getAnalysisStatusAllCategory('Project', fprData, dateRange, analysisYAML);
}

function getAnalysisStatusByProject (analysisCategories, projectSWID) {
	return getAnalysisStatusByCategory('Project', analysisCategories, projectSWID);
}

// returns the donors for a specified project SWID
function updateDonorsByProject (fprData, projectSWID) {
	var returnObj = {};
	returnObj[projectSWID] = {};
	returnObj[projectSWID]['Donors'] = [];
	returnObj[projectSWID]['Donor Totals'] = {};
	returnObj[projectSWID]['Project Name'] = fprData['Project'][projectSWID]['Project Name'];
	for (var donorSWID in fprData['Project'][projectSWID]['Donor']) {
		returnObj[projectSWID]['Donors'].push(fprData['Project'][projectSWID]['Donor'][donorSWID]);
	}
	returnObj[projectSWID]['Donors'] = _.uniq(returnObj[projectSWID]['Donors']);
	for (var i = 0; i < returnObj[projectSWID]['Donors'].length; i++) {
		if (/^(.*?)_.*/.test(returnObj[projectSWID]['Donors'][i])) {
			var match = /^(.*?)_.*/.exec(returnObj[projectSWID]['Donors'][i]);
			var donorHead = match[1];

			if (typeof returnObj[projectSWID]['Donor Totals'][donorHead] === 'undefined'){
				returnObj[projectSWID]['Donor Totals'][donorHead] = 1;
			} else {
				returnObj[projectSWID]['Donor Totals'][donorHead]++;
			}
		}
	}
	
	// Update in mongodb
	updateData('DonorsByProject', projectSWID, returnObj);

	return returnObj;
}

// returns the libraries for a specified project SWID
function updateLibrariesByProject (fprData, projectSWID) {
	var returnObj = {};
	returnObj[projectSWID] = {};
	returnObj[projectSWID]['Project Name'] = fprData['Project'][projectSWID]['Project Name'];
	returnObj[projectSWID]['Libraries'] = fprData['Project'][projectSWID]['Library'];
	returnObj[projectSWID]['Num Libraries'] = Object.keys(fprData['Project'][projectSWID]['Library']).length;

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
		returnObj[projectSWID]['Num of Runs'] = Object.keys(returnObj[projectSWID]['Run']).length;
	}
	
	return returnObj;
}

// takes in run data from getRunDataAllProjects
function updateRunDataByProject (runData, projectSWID) {
	var returnObj = {};
	returnObj[projectSWID] = runData[projectSWID];

	// Update in mongodb
	updateData('RunDataByProject', projectSWID, returnObj);

	return returnObj;
}

function updateProjectAcronym (fprData) {
	var projObj = {};
	projObj['4'] = {};
	projObj['4']['Project Name'] = 'ICGCPancreaticCancerSeq';
	for (var projectSWID in fprData['Project']) {
		console.log(projectSWID);
		console.log(fprData['Project'][projectSWID]['Project Name']);
	}
}

//// By Run

// for each run, returns a list of libraries and their SWID
function getRunInfo (fprData) {
	var returnObj = {};
	
	for (var runSWID in fprData['Run']) {
		returnObj[runSWID] = {};
		returnObj[runSWID]['Library Totals'] = {};
		returnObj[runSWID]['Donors'] = {};
		returnObj[runSWID]['Donor Totals'] = {};
		returnObj[runSWID]['Tissue Types'] = {};
		returnObj[runSWID]['Library Types'] = {};
		returnObj[runSWID]['Libraries'] = {};
		returnObj[runSWID]['Run Name'] = fprData['Run'][runSWID]['Run Name'];
		for (var IUSSWID in fprData['Run'][runSWID]['Library']) {
			returnObj[runSWID]['Libraries'][IUSSWID] = fprData['Run'][runSWID]['Library'][IUSSWID]['Library Name'];
		}
		returnObj[runSWID]['Num of libraries'] = Object.keys(returnObj[runSWID]['Libraries']).length;
	}

	// Determine library totals, tissue type totals, library type totals
	for (var runSWID in returnObj) {
		for (var IUSSWID in returnObj[runSWID]['Libraries']) {
			if (/(.*?)_/.test(returnObj[runSWID]['Libraries'][IUSSWID])) {
				var match = /(.*?)_/.exec(returnObj[runSWID]['Libraries'][IUSSWID]);
				var sampleHead = match[1];
				if (typeof returnObj[runSWID]['Library Totals'][sampleHead] === 'undefined') {
					returnObj[runSWID]['Library Totals'][sampleHead] = 1;
				} else {
					returnObj[runSWID]['Library Totals'][sampleHead]++;
				}
			}
			if (/.*?_.*?_.*?_(.?)/.test(returnObj[runSWID]['Libraries'][IUSSWID])) {
				var match = /.*?_.*?_.*?_(.?)/.exec(returnObj[runSWID]['Libraries'][IUSSWID]);
				var tissueType = match[1];
				if (typeof returnObj[runSWID]['Tissue Types'][tissueType] === 'undefined') {
					returnObj[runSWID]['Tissue Types'][tissueType] = 1;
				} else {
					returnObj[runSWID]['Tissue Types'][tissueType]++;
				}
			}
			if (/.*_(.*?)$/.test(returnObj[runSWID]['Libraries'][IUSSWID])) {
				var match = /.*_(.*?)$/.exec(returnObj[runSWID]['Libraries'][IUSSWID]);
				var libraryType = match[1];
				if (typeof returnObj[runSWID]['Library Types'][libraryType] === 'undefined') {
					returnObj[runSWID]['Library Types'][libraryType] = 1;
				} else {
					returnObj[runSWID]['Library Types'][libraryType]++;
				}
			}
			if (/(.*?_.*?)_/.test(returnObj[runSWID]['Libraries'][IUSSWID])) {
				var match = /(.*?_.*?)_/.exec(returnObj[runSWID]['Libraries'][IUSSWID]);
				var donor = match[1];
				if (typeof returnObj[runSWID]['Donors'][donor] === 'undefined') {
					returnObj[runSWID]['Donors'][donor] = 1;
				} else {
					returnObj[runSWID]['Donors'][donor]++;
				}
			}
		}
		for (var donor in returnObj[runSWID]['Donors']) {
			if(/(.*?)_/.test(donor)) {
				var match = /(.*?)_/.exec(donor);
				var donorHead = match[1];
				if (typeof returnObj[runSWID]['Donor Totals'][donorHead] === 'undefined') {
					returnObj[runSWID]['Donor Totals'][donorHead] = 1;
				} else {
					returnObj[runSWID]['Donor Totals'][donorHead]++;
				}
			}
		}
	}
	
	return returnObj;
}

// takes in libraries from getLibrariesAllRuns
function updateRunInfoBySWID (runInfo, runSWID) {
	var returnObj = {};
	returnObj[runSWID] = runInfo[runSWID];

	// Update in mongodb
	updateData('RunInfo', runSWID, returnObj);

	return returnObj;
}

//// By Donor
// for each donor, returns the external name, (TODO: institute), number of libraries per tissue type
function getDonorInfo (fprData) {
	var returnObj = {};

	for (var donorSWID in fprData['Donor']) {
		// to remove duplicates (because multiple donorSWIDs for a donor)
		var donorName = fprData['Donor'][donorSWID]['Donor Name'];
		if (typeof returnObj[donorName] === 'undefined') {
			returnObj[donorName] = {};
			returnObj[donorName]['Libraries'] = [];
			returnObj[donorName]['Library Total'] = {};
			returnObj[donorName]['External Name'] = {};
			returnObj[donorName]['Library Types'] = {};
			returnObj[donorName]['Tissue Types'] = {};
			returnObj[donorName]['SWID'] = [];
		}
		// Determine donor external name
		if (/external_name.*=(.*?);/.test(fprData['Donor'][donorSWID]['Donor Attributes'])) {
			var match = /external_name.*=(.*?);/.exec(fprData['Donor'][donorSWID]['Donor Attributes']);
			returnObj[donorName]['External Name'] = match[1];
		}
		for (var IUSSWID in fprData['Donor'][donorSWID]['Library']) {
			var lib = {};
			lib[IUSSWID] = fprData['Donor'][donorSWID]['Library'][IUSSWID]['Library Name'];
			returnObj[donorName]['Libraries'].push(lib);
		}
		
		
		//returnObj[donorName]['Tissue Types'] = donors[fprData['Donor'][donorSWID]['Donor Name']]['Tissue'];
		// keep track of SWIDs for a donor
		returnObj[donorName]['SWID'].push(donorSWID);
	}

	for (var donor in returnObj) {
		returnObj[donor]['Library Total'] = returnObj[donor]['Libraries'].length;
		for (var i = 0; i < returnObj[donor]['Libraries'].length; i++) {
			for (var IUSSWID in returnObj[donor]['Libraries'][i]) {
				// Determine number of library types
				if (/.*_(.*?)$/.test(returnObj[donor]['Libraries'][i][IUSSWID])) {
					var match = /.*_(.*?)$/.exec(returnObj[donor]['Libraries'][i][IUSSWID]);
					var libraryType = match[1];
					if (typeof returnObj[donor]['Library Types'][libraryType] === 'undefined') {
						returnObj[donor]['Library Types'][libraryType] = 1;
					} else {
						returnObj[donor]['Library Types'][libraryType]++;
					}
				}
				// Determine number of tissue types
				if (/.*?_.*?_.*?_(.?)/.test(returnObj[donor]['Libraries'][i][IUSSWID])) {
					var match = /.*?_.*?_.*?_(.?)/.exec(returnObj[donor]['Libraries'][i][IUSSWID]);
					var tissueType = match[1];
					if (typeof returnObj[donor]['Tissue Types'][tissueType] === 'undefined') {
						returnObj[donor]['Tissue Types'][tissueType] = 1;
					} else {
						returnObj[donor]['Tissue Types'][tissueType]++;
					}
				}	
			}
		}
	}
	
	return returnObj;
}

// takes in data from getDonorInfo
function updateDonorInfoByName (info, donor) {
	var returnObj = {};
	returnObj[donor] = info[donor];

	// Update in mongodb
	updateData('DonorInfo', donor, returnObj);

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
function updateStartEndDateByDonor (dates, donor) {
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

function updateAnalysisStatusByLibrary (analysisCategories, IUSSWID) {
	return getAnalysisStatusByCategory('Library', analysisCategories, IUSSWID);
}

// for each library, returns the library types, tissue types, tissue origins
function getLibraryInfo (fprData) {
	var returnObj = {};

	for (var IUSSWID in fprData['Library']) {
		returnObj[IUSSWID] = {};
		returnObj[IUSSWID]['Run'] = {};
		returnObj[IUSSWID]['Library Name'] = fprData['Library'][IUSSWID]['Library Name'];
		returnObj[IUSSWID]['Lane'] = fprData['Library'][IUSSWID]['Lane'];
		returnObj[IUSSWID]['Barcode'] = fprData['Library'][IUSSWID]['Barcode'];
		if (/library_source_template_type=(.*?)?/.test(fprData['Library'][IUSSWID]['Sample Attributes'])) {
			var match = /library_source_template_type=(.*?);/.exec(fprData['Library'][IUSSWID]['Sample Attributes']);
			returnObj[IUSSWID]['Library Type'] = match[1];
		}
		if (/tissue_type=(.*?)?/.test(fprData['Library'][IUSSWID]['Sample Attributes'])) {
			var match = /tissue_type=(.*?)?/.exec(fprData['Library'][IUSSWID]['Sample Attributes']);
			returnObj[IUSSWID]['Tissue Type'] = match[1];
		}
		if (/tissue_origin=(.*?);/.test(fprData['Library'][IUSSWID]['Sample Attributes'])) {
			var match = /tissue_origin=(.*?);/.exec(fprData['Library'][IUSSWID]['Sample Attributes']);
			returnObj[IUSSWID]['Tissue Origin'] = match[1];
		}
		for (var runSWID in fprData['Library'][IUSSWID]['Run']) {
			returnObj[IUSSWID]['Run'][runSWID] = fprData['Library'][IUSSWID]['Run'][runSWID];
		}
	}

	return returnObj;
}

function updateLibraryInfoBySWID (libraryInfo, IUSSWID) {
	var returnObj = {};
	returnObj[IUSSWID] = libraryInfo[IUSSWID];

	// Update in mongodb
	updateData('LibraryInfo', IUSSWID, returnObj);

	return returnObj;
}

// for each library, returns the workflow details such as name, skip, end date, and file paths
function getWorkflowAllLibraries (fprData, analysisYAML) {
	var returnObj = {};

	for (var IUSSWID in fprData['Library']) {
		returnObj[IUSSWID] = {};
		returnObj[IUSSWID]['Workflow Run'] = {};
		returnObj[IUSSWID]['Library Name'] = fprData['Library'][IUSSWID]['Library Name'];
		for (var workflowSWID in fprData['Library'][IUSSWID]['Workflow Run']) {
			returnObj[IUSSWID]['Workflow Run'][workflowSWID] = {};
			returnObj[IUSSWID]['Workflow Run'][workflowSWID]['File Paths'] = [];
			returnObj[IUSSWID]['Workflow Run'][workflowSWID]['Workflow Name'] = fprData['Library'][IUSSWID]['Workflow Run'][workflowSWID]['Workflow Name'];
			returnObj[IUSSWID]['Workflow Run'][workflowSWID]['Skip'] = fprData['Library'][IUSSWID]['Workflow Run'][workflowSWID]['Skip'];
			returnObj[IUSSWID]['Workflow Run'][workflowSWID]['End Date'] = getDateTimeString(fprData['Library'][IUSSWID]['Workflow Run'][workflowSWID]['Last Modified']);
			for (var analysisType in analysisYAML) {
				if (returnObj[IUSSWID]['Workflow Run'][workflowSWID]['Workflow Name'] in analysisYAML[analysisType]) {
					returnObj[IUSSWID]['Workflow Run'][workflowSWID]['Analysis Type'] = analysisType;
				}
			}
			for (var fileSWID in fprData['Library'][IUSSWID]['Workflow Run'][workflowSWID]['Files']) {
				returnObj[IUSSWID]['Workflow Run'][workflowSWID]['File Paths'].push(fprData['Library'][IUSSWID]['Workflow Run'][workflowSWID]['Files'][fileSWID]);
			}
		}
		returnObj[IUSSWID]['Num of workflow runs'] = Object.keys(returnObj[IUSSWID]['Workflow Run']).length;
	}

	return returnObj;
}

function updateWorkflowByLibrary (workflows, IUSSWID) {
	var returnObj = {};
	returnObj[IUSSWID] = workflows[IUSSWID];

	//Update in mongodb
	updateData('WorkflowByLibrary', IUSSWID, returnObj);

	return returnObj;
}

//// CUT REPORTING FUNCTIONS TO JUST ONE BECAUSE YOU CAN MAKE DONOR->LIBRARY CONNECTIONS ELSEWHERE, etc
//// Reporting Functions (detailed pages)
/*
// Returns associated JSON file per library per lane per donor
function getJSONFilesByLibraryAllDonors(fprData) {
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

// Returns associated report data based on JSON file per library per lane per run
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
*/
function updateLibrariesPerLaneByRun(fprData) {
	for (var runSWID in fprData['Run']) {
		var obj = {};
		obj[runSWID] = {};
		obj[runSWID]['Run Name'] = fprData['Run'][runSWID]['Run Name'];
		obj[runSWID]['Lane'] = {};
		for (var lane in fprData['Run'][runSWID]['Lane']) {
			if (typeof obj[runSWID]['Lane'][lane] === 'undefined') {
				obj[runSWID]['Lane'][lane] = {};
				obj[runSWID]['Lane'][lane]['Library'] = {};
			}
			for (var IUSSWID in fprData['Run'][runSWID]['Lane'][lane]['Library']) {
				obj[runSWID]['Lane'][lane]['Library'][IUSSWID] = fprData['Run'][runSWID]['Lane'][lane]['Library'][IUSSWID];
			}
		}

		//Update in mongodb
		updateData('LibrariesPerLaneByRun', runSWID, obj);
	}
}

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

function updateReportDataByLibrary(fprData) {
	// ALL DATA BASED ON REPORTS FROM JSON FILES

	// Individual library report data
	for (var IUSSWID in fprData['Library']) {
		var json = fprData['Library'][IUSSWID]['JSON'];
		var xenomeFile = fprData['Library'][IUSSWID]['XenomeFile'];
		var obj = {};
		obj[IUSSWID] = {};
		obj[IUSSWID]['Library Name'] = fprData['Library'][IUSSWID]['Library Name'];
		obj[IUSSWID]['Data'] = getReportData(json, xenomeFile);

		//Update in mongodb
		//updateData('ReportDataByLibrary', IUSSWID, obj);

		console.log(JSON.stringify(obj));

	}
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
	// rRNA Contamination (%reads aligned)
	if (TOTAL_READS != 0) {
		obj['% rRNA Content'] = ((RIBOSOMAL_READS/TOTAL_READS)*100).toFixed(2);
	} else {
		obj['% rRNA Content'] = 'Total Reads Job Failed -> re-run report';
	}
	return obj;
}

//var obj = {};
//obj = getRNASeqQCData('/oicr/data/archive/seqware/seqware_analysis_8/hsqwprod/seqware-results/RNAseqQc_2.3/92922100/140926_SN802_0204_AC5JLPACXX_ERNA_0041_nn_C_PE_398_WT_rnaqc.report.zip');

// Returns all RNA Seq QC data by running the above function getRNASeqQCData
function updateRNASeqQCDataByLibrary(fprData) {
	for (var IUSSWID in fprData['Library']) {
		if (typeof fprData['Library'][IUSSWID]['RNAZipFile'] !== 'undefined') {
			var obj = {};
			obj[IUSSWID] = {};
			obj[IUSSWID]['Library Name'] = fprData['Library'][IUSSWID]['Library Name'];
			obj[IUSSWID]['Data'] = getRNASeqQCData(fprData['Library'][IUSSWID]['RNAZipFile']);
			for (var runSWID in fprData['Library'][IUSSWID]['Run']) {
				obj[IUSSWID]['Data']['Run Name'] = fprData['Library'][IUSSWID]['Run'][runSWID];
			}
			obj[IUSSWID]['Data']['Lane'] = fprData['Library'][IUSSWID]['Lane'];

			//Update in mongodb
			//updateData('RNASeqQCDataByLibrary', IUSSWID, obj);
		
			console.log(JSON.stringify(obj));
		}
	}
}

function updateLaneDetailsTotalsByRun(fprData) {
	var laneObj = {};
	var runObj = {};

	for (var IUSSWID in fprData['Library']) {
		if (typeof fprData['Library'][IUSSWID]['JSON'] !== 'undefined') {
			MongoClient.connect(url, function(err, db) {
				if (err) return console.error(err);
				//console.log('connect');

				db.collection('ReportDataByLibrary').findOne({"_id": IUSSWID}, function(err, item){
					
					var run = item[IUSSWID]['Data']['Run Name'];
					var lane = item[IUSSWID]['Data']['Lane'];
					if (typeof laneObj[run] === 'undefined') {
						laneObj[run] = {};
						laneObj[run]['Lane'] = {};
					}
					if (typeof laneObj[run]['Lane'][lane] === 'undefined') {
						laneObj[run]['Lane'][lane] = {};
						laneObj[run]['Lane'][lane]['Raw Reads'] = 0;
						laneObj[run]['Lane'][lane]['Raw Yield'] = 0;
					}
					if (typeof runObj[run] === 'undefined') {
						runObj[run] = {};
						runObj[run]['% on Target'] = 0;
						runObj[run]['Reads'] = 0;
						runObj[run]['Yield'] = 0;
					}
					laneObj[run]['Lane'][lane]['Raw Reads'] += item[IUSSWID]['Data']['Reads'];
					laneObj[run]['Lane'][lane]['Raw Yield'] += item[IUSSWID]['Data']['Yield'];
					if (/(\d*.?\d*)%/.test(item[IUSSWID]['Data']['% on Target'])) {
						var match = /(\d*.?\d*)%/.exec(item[IUSSWID]['Data']['% on Target']);
						runObj[run]['% on Target'] = match[1];
					}
					runObj[run]['Reads'] += item[IUSSWID]['Data']['Reads'];
					runObj[run]['Yield'] += item[IUSSWID]['Data']['Yield'];
				});
			});
		}
		if (typeof fprData['Library'][IUSSWID]['RNAZipFile'] !== 'undefined') {
			MongoClient.connect(url, function(err, db) {
				if (err) return console.error(err);
				//console.log('connect');

				db.collection('RNASeqQCDataByLibrary').findOne({"_id": IUSSWID}, function(err, item){
					var run = item[IUSSWID]['Data']['Run Name'];
					var lane = item[IUSSWID]['Data']['Lane'];
					if (typeof laneObj[run] === 'undefined') {
						laneObj[run] = {};
						laneObj[run]['Lane'] = {};
					}
					if (typeof laneObj[run]['Lane'][lane] === 'undefined') {
						laneObj[run]['Lane'][lane] = {};
						laneObj[run]['Lane'][lane]['Raw Reads'] = 0;
						laneObj[run]['Lane'][lane]['Raw Yield'] = 0;
					}
					if (typeof runObj[run] === 'undefined') {
						runObj[run] = {};
						runObj[run]['% on Target'] = 0;
						runObj[run]['Reads'] = 0;
						runObj[run]['Yield'] = 0;
					}
					laneObj[run]['Lane'][lane]['Raw Reads'] += item[IUSSWID]['Data']['Total Reads'];
					laneObj[run]['Lane'][lane]['Raw Yield'] += item[IUSSWID]['Data']['Yield'];
					runObj[run]['Reads'] += item[IUSSWID]['Data']['Total Reads'];
					runObj[run]['Yield'] += item[IUSSWID]['Data']['Yield'];
				});
			});
		}
	}

	for (var run in laneObj) {
		var obj = {};
		obj[run] = laneObj[run];
		updateData('LaneDetailsTotalsByRun', run, obj);
	}
	for (var run in runObj) {
		var obj = {};
		obj[run] = runObj[run];
		updateData('RunDetailsTotals', run, obj);
	}
}


// Takes in json file and generates graph data
function generateGraphDataByJSON(json) {
	// Charts generated using Google charts
	var jsonString = fs.readFileSync(json, 'utf8');
	var lineObj = JSON.parse(jsonString);
	if (typeof lineObj['barcode'] === 'undefined'){
		lineObj['barcode'] = 'NoIndex';
	}
	var id = lineObj['run name'] + '_L00' + lineObj['lane'] + '_' + lineObj['barcode'] + '_' + lineObj['library'];
	var title = lineObj['run name'] + ' Lane: ' + lineObj['lane'] + ' Barcode: ' + lineObj['barcode'] + ' Library: ' + lineObj['library'];
	var graphData = {};
	graphData[id] = {};
	graphData[id]['Read Breakdown'] = {};
	graphData[id]['Insert Distribution'] = {};
	graphData[id]['Soft Clip by Cycle'] = {};
	graphData[id]['Title'] = title;

	// pie chart - read breakdown
	// initialize variables
	var pieArray = ['Number'];
	var colors = ['#878BB6', '#4ACAB4', '#FF8153', '#FFEA88'];
	var labels = ['Reads', 'on target', 'off target', 'repeat/low quality', 'unmapped'];
	pieArray.push(parseInt(lineObj['mapped reads']));
	pieArray.push(parseInt(lineObj['mapped reads']) - parseInt(lineObj['reads on target']));
	pieArray.push(parseInt(lineObj['qual fail reads']));
	pieArray.push(parseInt(lineObj['unmapped reads']));

	graphData[id]['Read Breakdown']['Colors'] = colors;
	graphData[id]['Read Breakdown']['Labels'] = labels;
	graphData[id]['Read Breakdown']['Data'] = pieArray;
	
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

    graphData[id]['Insert Distribution']['x values'] = xValInsert;
    graphData[id]['Insert Distribution']['y values'] = yValInsert;
    graphData[id]['Insert Distribution']['Colors'] = insertColors;

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

	graphData[id]['Soft Clip by Cycle']['x values'] = xValSoft;
	graphData[id]['Soft Clip by Cycle']['y values'] = yValSoft;

	// Update in mongodb
	//updateData('GraphData', id, graphData);
	return graphData;
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

		db.collection('GraphData').findOne({"_id": id}, function (err, item){
			pieValues = _.zip(item[id]['Read Breakdown']['Labels'], item[id]['Read Breakdown']['Data']);
			pieOptions = {
				title: item[id]['Title'] + ' Read Breakdown', 
				width: 600, height: 400, 
				colors: item[id]['Read Breakdown']['Colors']
			};
			insertLineValues = _.zip(item[id]['Insert Distribution']['x values'], item[id]['Insert Distribution']['y values'], item[id]['Insert Distribution']['Colors']);
			insertLineOptions = {
				title: item[id]['Title'] + ' Insert Distribution', 
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
			softLineValues = _.zip(item[id]['Soft Clip by Cycle']['x values'], item[id]['Soft Clip by Cycle']['y values']);
			softLineOptions = {
				title: item[id]['Title'] + ' Soft Clips by Cycle', 
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
//Test graph
//generateGraphDataByJSON('SWID_3165537_PV_0001_Bm_P_PE_423_EX_3_151216_D00331_0149_AC8L3CANXX_AACGTGAT_L001_R1_001.annotated.bam.BamQC.json');
//drawGraphsById('110513_I581_00032_70CGE_LT_L005_TAGCTT_PCSI_0050_Pa_X_PE_397_EX');

function getSeqWareStatsAllDates(fprData) {
	var returnObj = {};

	// Number of workflows per status
	for (var workflowSWID in fprData['Workflow']) {
		if (/(.*?) /.test(fprData['Workflow'][workflowSWID]['Last Modified'])) {
			var match = /(.*?) /.exec(fprData['Workflow'][workflowSWID]['Last Modified']);
			var date = match[1];
		}
		var status = fprData['Workflow'][workflowSWID]['Status'];
		if (typeof returnObj[date] === 'undefined') {
			returnObj[date] = {};
			returnObj[date]['Num workflow runs'] = {};
			returnObj[date]['Cumulative workflow runs'] = {};
		}
		if (typeof returnObj[date]['Num workflow runs'][status] === 'undefined') {
			returnObj[date]['Num workflow runs'][status] = 1;
		} else {
			returnObj[date]['Num workflow runs'][status]++;
		}
	}

	// Number of libraries added per day
	for (var IUSSWID in fprData['Library']) {
		if (/(.*?) /.test(fprData['Library'][IUSSWID]['Last Modified'])) {
			var match = /(.*?) /.exec(fprData['Library'][IUSSWID]['Last Modified']);
			var date = match[1];
		}
		if (typeof returnObj[date]['Num of Libraries'] === 'undefined') {
			returnObj[date]['Num of Libraries Completed'] = 1;
		} else {
			returnObj[date]['Num of Libraries Completed']++;
		}

	}

	// Number of Projects added per day
	for (var projectSWID in fprData['Project']) {
		if (/(.*?) /.test(fprData['Project'][projectSWID]['Last Modified'])) {
			var match = /(.*?) /.exec(fprData['Project'][projectSWID]['Last Modified']);
			var date = match[1];
		}
		if (typeof returnObj[date]['Num of Projects'] === 'undefined') {
			returnObj[date]['Num of Projects Completed'] = 1;
		} else {
			returnObj[date]['Num of Projects Completed']++;
		}
	}

	// Cumulative numbers of each field
	var total = {completed: 0, failed: 0, running: 0, cancelled: 0};
	var libTotal = 0;
	var projTotal = 0;
	for (var date in returnObj) {
		if (typeof returnObj[date]['Num workflow runs'] !== 'undefined') {
			for (var status in total) {
				if (typeof returnObj[date]['Num workflow runs'][status] !== 'undefined') {
					total[status] += returnObj[date]['Num workflow runs'][status];
				}
				returnObj[date]['Cumulative workflow runs'][status] = total[status];
			}
		}
		if (typeof returnObj[date]['Num of Libraries Completed'] !== 'undefined') {
			libTotal += returnObj[date]['Num of Libraries Completed'];
		}
		if (typeof returnObj[date]['Num of Projects Completed'] !== 'undefined') {
			projTotal += returnObj[date]['Num of Projects Completed'];
		}
		returnObj[date]['Cumulative Libraries Processed'] = libTotal;
		returnObj[date]['Cumulative Projects Completed'] = projTotal;
	}

	return returnObj;
}

// Takes in output from getAnalysisStatusAllLibraries(fprData, null, analysisYAML)
function updateWorkflowStatusLibrariesAllDates(fprData) {
	var returnObj = {};
	
	for (var IUSSWID in fprData['Library']) {
		for (var workflowSWID in fprData['Library'][IUSSWID]['Workflow Run']) {
			if (/(.*?) /.test(fprData['Library'][IUSSWID]['Workflow Run'][workflowSWID]['Last Modified'])) {
				var match = /(.*?) /.exec(fprData['Library'][IUSSWID]['Workflow Run'][workflowSWID]['Last Modified']);
				var date = match[1];

				if (typeof returnObj[date] === 'undefined') {
					returnObj[date] = {};
					returnObj[date]['Libraries'] = {};
				}
				returnObj[date]['Libraries'][IUSSWID] = {};
				returnObj[date]['Libraries'][IUSSWID]['Library Name'] = fprData['Library'][IUSSWID]['Library Name'];
				returnObj[date]['Libraries'][IUSSWID]['Last Modified Workflow'] = getDateTimeString(fprData['Library'][IUSSWID]['Workflow Run'][workflowSWID]['Last Modified']);
			}
		}
	}

	for (var date in returnObj) {
		var obj = {};
		obj[date] = returnObj[date];
		updateData('WorkflowStatusLibrariesByDate', date, obj);
	}

	return returnObj;
}

function updateNumCompletedWorkflowsForRunByDate(fprDataRun, fprDataLibrary) {
	var returnObj = {};

	for (var runSWID in fprDataRun['Run']) {
		if(typeof returnObj[runSWID] === 'undefined') {
			returnObj[runSWID] = {};
			returnObj[runSWID]['Completed Workflows'] = 0;
			returnObj[runSWID]['Completed Libraries'] = 0;
		}
		returnObj[runSWID]['Run Name'] = fprDataRun['Run'][runSWID]['Run Name'];
		for (var IUSSWID in fprDataRun['Run'][runSWID]['Library']) {
			var complete = true;
			for (var workflowSWID in fprDataLibrary['Library'][IUSSWID]['Workflow Run']) {
				if (fprDataLibrary['Library'][IUSSWID]['Workflow Run'][workflowSWID]['Status'] == 'completed') {
					returnObj[runSWID]['Completed Workflows']++;
				} else {
					complete = false;
				}
			}
			if (complete) {
				returnObj[runSWID]['Completed Libraries']++;
			}
		}
	}
	for (var runSWID in returnObj) {
		var obj = {};
		obj[runSWID] = returnObj[runSWID];
		updateData('NumCompletedWorkflowsForRunByDate', runSWID, obj);
	}

	return returnObj;
}

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
			if (typeof fprData[category][SWID]['Barcode'] !== 'undefined') {
				returnObj[SWID]['Barcode'] = fprData[category][SWID]['Barcode'];
			}
			if (typeof fprData[category][SWID]['Lane'] !== 'undefined') {
				returnObj[SWID]['Lane'] = fprData[category][SWID]['Lane'];
			}
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





//// PINERY DATA FUNCTIONS
// Parses data from files generated by pinery for current pipeline stats
function getInstrumentIDs(instrumentData) {
	var returnObj = {};

	for (var i = 0; i < instrumentData.length; i++) {
		returnObj[instrumentData[i]['id']] = instrumentData[i]['name'];
	}

	return returnObj;
}

function getSampleIDInfo(sampleData) {
	var returnObj = {};

	for (var i = 0; i < sampleData.length; i++) {
		returnObj[sampleData[i]['id']] = {};
		returnObj[sampleData[i]['id']]['Library Name'] = sampleData[i]['name'];
		returnObj[sampleData[i]['id']]['Start Date'] = sampleData[i]['created_date'];
		returnObj[sampleData[i]['id']]['Project Name'] = sampleData[i]['project_name'];
	}

	return returnObj;
}

function updatePipelineStatus(sequencerData, sampleData) {
	var returnObj = {};
	var sampleIDInfo = getSampleIDInfo(sampleData);

	// Build data for running and failed sequencer runs
	for (var i = 0; i < sequencerData.length; i++) {
		if (sequencerData[i]['state'] == 'Running' || sequencerData[i]['state'] == 'Failed') {
			returnObj[sequencerData[i]['id']] = {};
			returnObj[sequencerData[i]['id']]['State'] = sequencerData[i]['state'];
			returnObj[sequencerData[i]['id']]['Run Name'] = sequencerData[i]['name'];
			returnObj[sequencerData[i]['id']]['Start Date'] = sequencerData[i]['created_date'];
			returnObj[sequencerData[i]['id']]['Lanes'] = {};
			
			if (Object.prototype.toString.call(sequencerData[i].positions) === '[object Array]') {
				for (var j = 0; j < sequencerData[i].positions.length; j++) {
					if (typeof returnObj[sequencerData[i]['id']]['Lanes'][sequencerData[i].positions[j].position] === 'undefined') {
						returnObj[sequencerData[i]['id']]['Lanes'][sequencerData[i].positions[j].position] = {};
						returnObj[sequencerData[i]['id']]['Lanes'][sequencerData[i].positions[j].position]['Samples'] = [];
					}
					for (var k = 0; k < sequencerData[i].positions[j].samples.length; k++) {
						var obj = {};
						obj['id'] = sequencerData[i].positions[j].samples[k].id;
						obj['Project'] = sampleIDInfo[sequencerData[i].positions[j].samples[k].id]['Project Name'];
						obj['Library Name'] = sampleIDInfo[sequencerData[i].positions[j].samples[k].id]['Library Name'];
						returnObj[sequencerData[i]['id']]['Lanes'][sequencerData[i].positions[j].position]['Samples'].push(obj);
					}
				}
			} else if (typeof sequencerData[i].positions !== 'undefined') {
				if (typeof returnObj[sequencerData[i]['id']]['Lanes'][sequencerData[i].positions.position] === 'undefined') {
					returnObj[sequencerData[i]['id']]['Lanes'][sequencerData[i].positions.position] = {};
					returnObj[sequencerData[i]['id']]['Lanes'][sequencerData[i].positions.position]['Samples'] = [];
				}
				var obj = {};
				obj['id'] = sequencerData[i].positions.id;
				obj['Project'] = sampleIDInfo[sequencerData[i].positions.id]['Project Name'];
				obj['Library Name'] = sampleIDInfo[sequencerData[i].positions.id]['Library Name'];
				returnObj[sequencerData[i]['id']]['Lanes'][sequencerData[i].positions.position]['Samples'].push(obj);
			} else {
				//console.log(sequencerData[i]);
			}
		}

	}
	
	// Count sample total for each project
	for (var id in returnObj) {
		returnObj[id]['Projects'] = {};
		for (var lane in returnObj[id]['Lanes']) {
			for (var i = 0; i < returnObj[id]['Lanes'][lane]['Samples'].length; i++) {
				if (typeof returnObj[id]['Projects'][returnObj[id]['Lanes'][lane]['Samples'][i]['Project']] == 'undefined') {
					returnObj[id]['Projects'][returnObj[id]['Lanes'][lane]['Samples'][i]['Project']] = 1;
				} else {
					returnObj[id]['Projects'][returnObj[id]['Lanes'][lane]['Samples'][i]['Project']]++;
				}
			}
		}
	}
	for (var id in returnObj) {
		var obj = {};
		obj[id] = returnObj[id];

		// Update in mongodb
		updateData('PipelineStatus', id, obj);
	}

	return returnObj;
}

function updateStartDateAllRuns(sequencerData) {
	var returnObj = {};

	for (var i = 0; i < sequencerData.length; i++) {
		returnObj[sequencerData[i]['name']] = getDateTimeString(sequencerData[i]['created_date']);
	}

	for (var run in returnObj) {
		var obj = {};
		obj[run] = returnObj[run];

		// Update in mongodb
		updateData('StartDateByRun', run, obj);
	}
	return returnObj;
}

function updateStartDateAllProjects(projectData) {
	var returnObj = {};

	for (var i = 0; i < projectData.length; i++) {
		returnObj[projectData[i]['name']] = getDateTimeString(projectData[i]['earliest']);
	}

	for (var project in returnObj) {
		var obj = {};
		obj[project] = returnObj[project];

		// Update in mongodb
		updateData('StartDateByProject', project, obj);
	}
	return returnObj;
}

function updateSequencingStatusAllLibraries(sequencerData, sampleData) {
	var returnObj = {};
	var sampleIDInfo = getSampleIDInfo(sampleData);

	for (var i = 0; i < sequencerData.length; i++) {
		// Pooled Sample
		if (Object.prototype.toString.call(sequencerData[i].positions) === '[object Array]') {
			for (var j = 0; j < sequencerData[i].positions.length; j++) {
				for (var k = 0; k < sequencerData[i].positions[j].samples.length; k++) {
					returnObj[sequencerData[i].positions[j].samples[k].id] = {};
					returnObj[sequencerData[i].positions[j].samples[k].id]['Library Name'] = sampleIDInfo[sequencerData[i].positions[j].samples[k].id]['Library Name'];
					returnObj[sequencerData[i].positions[j].samples[k].id]['Status'] = sequencerData[i].state;
					returnObj[sequencerData[i].positions[j].samples[k].id]['Lane'] = sequencerData[i].positions[j].position;
				}
			}
		// Single Sample
		} else if (typeof sequencerData[i].positions !== 'undefined') {
			returnObj[sequencerData[i].positions.id] = {};
			returnObj[sequencerData[i].positions.id]['Library Name'] = sampleIDInfo[sequencerData[i].positions.id]['Library Name'];
			returnObj[sequencerData[i].positions.id]['Status'] = sequencerData[i].state;
			returnObj[sequencerData[i].positions.id]['Lane'] = sequencerData[i].positions.position;
		// Failed Sequencer Runs with no samples
		} else {
			//console.log(sequencerData[i]);
		}
	}

	for (var id in returnObj) {
		var obj = {};
		obj[id] = returnObj[id];

		updateData('SequencingStatusByLibrary', id, obj);
	}

	return returnObj;
}

function updateExternalNameAndInstituteAllDonors(sampleData) {
	var returnObj = {};

	for (var i = 0; i < sampleData.length; i++) {
		if (/(.*?_.*?)_/.test(sampleData[i].name)) {
			var match = /(.*?_.*?)_/.exec(sampleData[i].name);
			var donor = match[1];
			if (typeof sampleData[i].attributes !== 'undefined') {
				for (var j = 0; j < sampleData[i].attributes.length; j++) {
					if (sampleData[i].attributes[j].name == 'Institute') {
						if (typeof returnObj[match[1]] === 'undefined') {
							returnObj[match[1]] = {};
						}
						returnObj[match[1]]['Institute'] = sampleData[i].attributes[j].value;
					} else if (sampleData[i].attributes[j].name == 'External Name') {
						if (typeof returnObj[match[1]] === 'undefined') {
							returnObj[match[1]] = {};
						}
						returnObj[match[1]]['External Name'] = sampleData[i].attributes[j].value;
					}
				}
			}
		}
	}

	for (var donor in returnObj) {
		var setMod = { $set: {} };
		setMod.$set[donor + '.External Name'] = returnObj[donor]['External Name'];
		setMod.$set[donor + '.Institute'] = returnObj[donor]['Institute'];
		updateDataField('DonorInfo', donor, setMod);
	}
	return returnObj;
}

function updateRunningSequencerRuns(sequencerData) {

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
		//console.log('connected');

		// Return updated info to mongodb, insert if not already in db
		db.collection(collection).updateOne({_id: data['_id']}, data, {upsert: true}, function (err) {
			if (err) return console.error(err);
			db.close();
		});
	});
}

function updateDataField(collection, id, data) {
 	MongoClient.connect(url, function(err, db) {
		if (err) return console.error(err);
		//console.log('connected');

		// Return updated info to mongodb, insert if not already in db
		db.collection(collection).updateOne({_id: id}, data, {upsert: true}, function (err) {
			if (err) return console.error(err);
			db.close();
		});
	});
}