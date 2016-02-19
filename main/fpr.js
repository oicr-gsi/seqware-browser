// Send get requests to this script to obtain file provenance report data in JSON format

var fs = require('fs');
var _ = require('underscore');
var YAML = require('yamljs');
var readMultipleFiles = require('read-multiple-files');

var dateNow = new Date();
var analysisYAML;

// read fpr-Project/fpr-Workflow/fpr-Library JSON created by associated perl script
//TODO: Maybe create a separate JSON just for this?

readMultipleFiles([process.argv[3], process.argv[4], process.argv[6]], 'utf8', function(err, data){
	if (err) return console.error(err);
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
	fprData = JSON.parse(data);

	// functions associated with project key
	
	var obj;
	//obj = getCurrentStatsByProject(fprData, '', '', '10');
	//obj = getLastModifiedProjects(fprData, 30);
	//obj = getStartDateAllProjects(fprData);
	//obj = getStartDateByProject(fprData, '10');
	//obj = getAnalysisStatusAllProjects(fprData, 30, analysisYAML);
	//obj = getAnalysisStatusByProject(fprData, analysisYAML, '10');

	//obj = getNumDonorsAllProjects(fprData);
	//obj = getNumDonorsByProject(fprData, '10');
	//obj = getDonorsByProject(fprData, '10');
	
	//obj = getNumLibrariesAllProjects(fprData);
	//obj = getNumLibrariesByProject(fprData, '10');
	//obj = getLibrariesByProject(fprData, '10');

	//obj = getRunDataAllProjects(fprData, '2015-01-01 00:00:00', '', analysisYAML);
	//obj = getRunDataByProject(fprData, '2015-01-01 00:00:00', '', '10', analysisYAML);
	
	if (typeof obj !== 'undefined') {
		obj = JSON.stringify(obj);
		console.log(obj);
	}
});

// read fpr-Run JSON
fs.readFile(process.argv[5], 'utf8', function(err, data){
	if (err) return console.error(err);
	console.log("starting run");
	fprData = JSON.parse(data);

	// functions associated with run key
	var obj;
	//obj = getLibrariesAllRuns(fprData);
	//obj = getLibrariesByRun(fprData, '8002');

	if (typeof obj !== 'undefined') {
		obj = JSON.stringify(obj);
		console.log(obj);
	}
});

// read fpr-Library JSON
fs.readFile(process.argv[6], 'utf8', function(err, data){
	if (err) return console.error(err);
	console.log("starting library");
	fprData = JSON.parse(data);

	// functions associated with library key
	var obj;
	//obj = getAnalysisStatusAllLibraries(fprData, 30, analysisYAML);
	//obj = getAnalysisStatusByLibrary(fprData, analysisYAML, '133');

	//obj = getLibraryInfo(fprData);
	//obj = getLibraryInfoBySWID(fprData, '165');

	//obj = getWorkflowAllLibraries(fprData);
	//obj = getWorkflowByLibrary(fprData, '165');

	if (typeof obj !== 'undefined') {
		obj = JSON.stringify(obj);
		console.log(obj);
	}
});

// read fpr-Donor JSON
fs.readFile(process.argv[7], 'utf8', function(err, data){
	if (err) return console.error(err);
	console.log("starting donor");
	fprData = JSON.parse(data);

	//functions associated with donor key
	var obj;
	//obj = getDonorInfo(fprData);
	//obj = getDonorInfoByName(fprData, 'PCSI_0625');

	//obj = getNumLibrariesPerTissueAllDonors(fprData);
	//obj = getNumLibrariesPerTissueByDonor(fprData, 'BLBC_0013');

	//obj = getNumOfLibraryTypeAllDonors(fprData);
	//obj = getNumOfLibraryTypeByDonor(fprData, 'PCSI_0023');

	//obj = getStartEndDateAllDonors(fprData)
	//obj = getStartEndDateByDonor(fprData, 'PCSI_0023');

	//obj = getInstrumentNamesAllDonors(fprData);
	//obj = getInstrumentNamesByDonor(fprData, 'PCSI_0023');

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
	
	returnObj[projectSWID]['Project Name'] = fprData['Project'][projectSWID]['Project Name'];
	returnObj[projectSWID]['Project Libraries'] = Object.keys(fprData['Project'][projectSWID]['Library Name']).length;
	
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

function getStartDateByProject (fprData, projectSWID) {
	var dates = getStartDateAllProjects(fprData);
	var returnObj = {};
	returnObj[projectSWID] = dates[projectSWID];
	
	return returnObj;
}

// for each project, returns workflow run analysis status (complete, failed, running, cancelled) based on type of workflow
function getAnalysisStatusAllProjects (fprData, dateRange, analysisYAML) {
	return getAnalysisStatusAllCategory('Project', fprData, dateRange, analysisYAML);
}

function getAnalysisStatusByProject (fprData, analysisYAML, projectSWID) {
	return getAnalysisStatusByCategory('Project', fprData, analysisYAML, projectSWID);
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

function getNumDonorsByProject (fprData, projectSWID) {
	var donors = getNumDonorsAllProjects(fprData);
	var returnObj = {};
	
	returnObj[projectSWID] = donors[projectSWID];
	return returnObj;
}

// returns the donors for a specified project SWID
function getDonorsByProject (fprData, projectSWID) {
	var returnObj = {};
	returnObj[projectSWID] = {};
	returnObj[projectSWID]['Project Name'] = fprData['Project'][projectSWID]['Project Name'];
	returnObj[projectSWID]['Donors'] = Object.keys(fprData['Project'][projectSWID]['Donor Name']);
	
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

function getNumLibrariesByProject (fprData, projectSWID) {
	var libraries = getNumLibrariesAllProjects(fprData);
	var returnObj = {};

	returnObj[projectSWID] = libraries[projectSWID];
	return returnObj;
}

// returns the libraries for a specified project SWID
function getLibrariesByProject (fprData, projectSWID) {
	var returnObj = {};
	returnObj[projectSWID] = {};
	returnObj[projectSWID]['Project Name'] = fprData['Project'][projectSWID]['Project Name'];
	returnObj[projectSWID]['Libraries'] = Object.keys(fprData['Project'][projectSWID]['Library Name']);
	
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

function getRunDataByProject (fprData, dateFrom, dateTo, projectSWID, analysisYAML) {
	var runs = getRunDataAllProjects (fprData, dateFrom, dateTo, analysisYAML);
	var returnObj = {};
	returnObj[projectSWID] = runs[projectSWID];
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

function getLibrariesByRun (fprData, runSWID) {
	var libraries = getLibrariesAllRuns(fprData);
	var returnObj = {};
	returnObj[runSWID] = libraries[runSWID];
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

function getDonorInfoByName (fprData, donor) {
	var info = getDonorInfo(fprData);
	var returnObj = {};
	returnObj[donor] = info[donor];
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

function getNumLibrariesPerTissueByDonor (fprData, donor) {
	var libraries = getNumLibrariesPerTissueAllDonors(fprData);
	var returnObj = {};
	returnObj[donor] = libraries[donor];
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

function getNumOfLibraryTypeByDonor (fprData, donor) {
	var donors = getNumOfLibraryTypeAllDonors(fprData);
	var returnObj = {};
	returnObj[donor] = donors[donor];
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

function getStartEndDateByDonor (fprData, donor) {
	var donors = getStartEndDateAllDonors(fprData);
	var returnObj = {};
	returnObj[donor] = {};
	returnObj[donor] = donors[donor];

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

function getInstrumentNamesByDonor (fprData, donor) {
	var instruments = getInstrumentNamesAllDonors(fprData);
	var returnObj = {};
	returnObj[donor] = instruments[donor];
	return returnObj;
}

//// By Library
// for each library, returns workflow run analysis status (complete, failed, running, cancelled) based on type of workflow
function getAnalysisStatusAllLibraries (fprData, dateRange, analysisYAML) {
	return getAnalysisStatusAllCategory('Library', fprData, dateRange, analysisYAML);
}

function getAnalysisStatusByLibrary (fprData, analysisYAML, sampleSWID) {
	return getAnalysisStatusByCategory('Library', fprData, analysisYAML, sampleSWID);
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

function getLibraryInfoBySWID (fprData, sampleSWID) {
	var info = getLibraryInfo(fprData);
	var returnObj = {};
	returnObj[sampleSWID] = info[sampleSWID];
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

function getWorkflowByLibrary (fprData, sampleSWID) {
	var workflows = getWorkflowAllLibraries(fprData);
	var returnObj = {};
	returnObj[sampleSWID] = workflows[sampleSWID];
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

function getAnalysisStatusByCategory(category, fprData, analysisYAML, SWID) {
	var categories = getAnalysisStatusAllCategory(category, fprData, null, analysisYAML);
	var returnObj = {};
	returnObj[SWID] = categories[SWID];
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