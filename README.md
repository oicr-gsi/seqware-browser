seqware-browser
================
## What is the SeqWare Browser
The SeqWare browser is a reporting website that can be used to gather run and analysis details on projects by SeqWare. By gathering information from pinery, the seqware database, and the file provenance report, it updates dynamically for the most up-to-date information.

Next gen seqware browser calls for foundational code that will parse data from data sources and update SeqWare data in a MongoDB database, which can then be queried by the front end to populate the web pages with relevant data.

Data is collected from these main data sources: 
- SeqWare PostGreSQL database
- pinery webservice
- file provenance report
- json reports and directories (flat files)

## File Structures
### seqware-browser
```
main
├── functions.js
├── fpr-json.pl
├── fpr-runs.pl
├── graphTest.html
└── scripts
    ├── fpr-file.js
    ├── fpr-graph-data.js
    ├── fpr-report-data.js
    ├── fpr-rna-data.js
    ├── pinery-data-donor.js
    ├── pinery-data-library.js
    ├── pinery-data-project.js
    ├── pinery-data-run.js
    ├── run-report.js
    ├── RunReport.pl
    ├── seqware-db-current-wfs.js
    └── seqware-db-wfs.js
 test
 └── extractTest.js
```

### Other required files (directories and locations determined by sqwwhich)
```
- config.js
- file provenance report
cronscripts
├── current-runs.cron
├── update-fpr-data.cron
├── update-pinery-info.cron
└── update-run-report.cron
```

### Temporary files 
It is suggested that the outputs of these files be added to a /tmp directory

These files are either downloaded from Pinery webservice or SeqWare metadatabase, or produced by fpr-json.pl, fpr-runs.pl

```
Pinery
- runs.out (sequencer runs)
- samples.out (samples)
- projects.out (projects)

SeqWare metadatabase
- skip.json
- receive_dates.json

fpr-json.pl
- fpr-Library.json
- fpr-File.json

fpr-runs.pl
- runs.txt
```

## Set-up
The back end uses a NodeJS framework and some install packages. First, install NodeJS and npm (node package manager). The packages that are installed locally into a node_modules directory are:
- adm-zip
- JSON
- fs
- yamljs
- underscore
- read-multiple-files
- mongodb
- pg

Most scripts under seqware-browser/main/scripts require functions from 'functions.js'.

'functions.js' path should be added to NODE_PATH environment variable, as well as access to the config.js file

### Config.js
This is the configuration file that functions.js reads from to connect to databases: mongo and postgresql.

Note: subject to change if more credentials are required for mongo

```
var config = {};
 
config.mongo = {};
config.postgres = {};
 
//Mongo database
config.mongo.host = <mongo hostname>;
config.mongo.database = 'seqwareBrowser';
 
//Seqware database
config.postgres.username = <username>;
config.postgres.password = <password>;
config.postgres.host = <postgres hostname>;
config.postgres.port = <postgres port>;
config.postgres.database = <seqware database>;
 
module.exports = config;
```
### Cron Scripts
These scripts automate the running of the js/perl scripts under seqware-browser/main/scripts to update mongodb

A list of the bash scripts and their dependencies (js/perl scripts and data sources), and what they update can be found below

The order of the table is the order in which the scripts are run

---
#### current-runs.sh
Script runs more frequently to update collections that require more up-to-date information

runs.out is downloaded from Pinery webservice

| Scripts                   | Dependencies     | Update collection   |
|---------------------------|------------------|---------------------|
| seqware-db-current-wfs.js | workflowRuns.yml | [CurrentWorkflowRuns](#current-workflow-runs) |
| pinery-data-run.js        | runs.out         | [RunInfo](#run-info)  |

---
#### update-fpr-data.sh
Data is updated from information in the file provenance report
- Perl script: fpr-json.pl (used to parse the file provenance report into fpr-File.json and fpr-Library.json)
- Data source: file provenance report

| Scripts            | Dependencies     | Update collection   |
|--------------------|------------------|---------------------|
| fpr-file.js        | fpr-File.json    | [FileInfo](#file-info) |
| fpr-report-data.js | fpr-Library.json | [IUSSWIDReportData](#iusswidreportdata) |
| fpr-rna-data.js    | fpr-Library.json | [IUSSWIDRNASeqQCData](#iusswidrnaseqqcdata) |
| fpr-graph-data.js  | fpr-Library.json | [IUSSWIDGraphData](#iusswidgraphdata)    |

---
#### update-pinery-info.sh
This script downloads data sources by accessing pinery webservice and SeqWare PostGreSQL database

| Scripts                | Dependencies                                         | Update collection         |
|------------------------|------------------------------------------------------|---------------------------|
| pinery-data-donor.js   | runs.out, samples.out                                | [DonorInfo](#donor-info)  |
| pinery-data-library.js | runs.out, samples.out, skip.json, receive_dates.json | [LibraryInfo](#library-info) |
| seqware-db-wfs.js      | workflowRuns.yml                                     | [WorkflowInfo](#workflow-info),  [LibraryInfo](#library-info) |
| pinery-data-project.js | projects.out                                         | [ProjectInfo](#project-info) |

---
#### update-run-report.sh
- Perl script: fpr-runs.pl
- Data source: file provenance report
- Output: runs.txt

runs.txt file which is list of all sequencer runs in the file provenance report and for each run, creates two new jobs.

1. perl script that gathers data from the run directory and outputs to {run}.json file
  - Uses the function get_XML_Data from wideInstrumentReport.pm perl module for each run
2. js script that updates that output file to mongodb

| Scripts       | Dependencies                                    | Update collection |
|---------------|-------------------------------------------------|-------------------|
| RunReport.pl  | runs.txt > {run}.json files to output directory |                   |
| run-report.js | {run}.json files produced above                 | [RunReportData](#run-report-data) |

Note: step 1 perl module outputs returned object into json file that is taken in by a separate javascript file to upload to mongo (can't directly upload to mongo because unable to use MongoDB.pm on the cluster due to outdated C compilier libc6.so)

---
### Testing
Unit.js was used for testing the QC Collection loading functions found in main/QCScripts. They look at all three scripts: extractFunctions.js, transformFunctions.js, and loadFunctions.js
Firstly, npm inistall unitjs, chain and mocha, which are also listed in the package.json file. 
Next, make a temporary directory called tmp in the same directory level as main and test.
To run the tests, type npm test into the command line.
### MongoDB
Install mongo from the mongodb website

Mongo databases are organized by database > collections > documents

The documents within the collection each have their own '_id' which is generated by Mongo and is effective for uniqueness. 

Indexes for faster querying have been added (when function.js function is run)

```
$ mongo
> use <database name>
> show collections
```

- [CurrentWorkflowRuns](#current-workflow-runs)
- [DonorInfo](#donor-info)
- [FileInfo](#file-info)
- [IUSSWIDGraphData](#iusswidgraphdata)
- [IUSSWIDRNASeqQCData](#iusswidrnaseqqcdata)
- [IUSSWIDReportData](#iusswidreportdata)
- [LibraryInfo](#library-info)
- [ProjectInfo](#project-info)
- [RunInfo](#run-info)
- [RunReportData](#run-report-data)
- [WorkflowInfo](#workflow-info)

## Collections

#### Current Sequencer Runs
Can be queried from the RunInfo collection for "status": "Running" and create date before the date 2014-02-01.

Runs a query in seqware database for all completed sequencer runs after 2014-02-01 and compares the output to the running sequencer runs from pinery.

#### Current Workflow Runs
Table may be removed due to redundancies in [WorkflowInfo](#workflow-info) collection

- sw_accession: workflow SWID
- workflow_run_id: workflow run id given by seqware
- status: workflow run status
- status_cmd: oozie id
- start_tstmp: create date
- end_tstmp: based on last modified date
- workflow_name: workflow name and version
- analysis_type: workflow analysis type

```
> db.CurrentWorkflowRuns.find()
{
  "_id": ObjectId("57168098ba507b1cd34c6813"),
  "sw_accession": "3452850",
  "workflow_run_id": 201917,
  "status": "running",
  "status_cmd": "0000757-160202125311466-oozie-oozi-W",
  "start_tstmp": "2016-03-22 10:46:37",
  "end_tstmp": "2016-03-22 15:04:21",
  "workflow_name": "CASAVA_2.8",
  "analysis_type": "Base calling"
}{
  "_id": ObjectId("57168098ba507b1cd34c6815"),
  "sw_accession": "3447735",
  "workflow_run_id": 201886,
  "status": "running",
  "status_cmd": "0000721-160202125311466-oozie-oozi-W",
  "start_tstmp": "2016-03-21 10:45:40",
  "end_tstmp": "2016-03-21 14:46:04",
  "workflow_name": "CASAVA_2.8",
  "analysis_type": "Base calling"
}{
  "_id": ObjectId("57168098ba507b1cd34c6817"),
  "sw_accession": "3439496",
  "workflow_run_id": 201816,
  "status": "running",
  "status_cmd": "0000628-160202125311466-oozie-oozi-W",
  "start_tstmp": "2016-03-15 15:43:45",
  "end_tstmp": "2016-03-15 19:44:02",
  "workflow_name": "CASAVA_2.8",
  "analysis_type": "Base calling"
}
...
```

Runs a query in seqware database for all workflow runs with status = 'running' and adds to CurrentWorkflowRuns collection. 

The sw_accession for all documents in the CurrentWorkflowRuns collection are also queried for and if the status changes, the document is removed from the collection and updated in WorkflowInfo collection and other associated collections that require Workflow data. If the status = 'failed', the document is added to a FailedWorkflowRuns collection.

#### Failed Workflow Runs
- sw_accession: workflow SWID
- workflow_run_id: workflow run id given by seqware
- status: workflow run status
- status_cmd: oozie id
- start_tstmp: create date
- end_tstmp: based on last modified date
- workflow_name: workflow name and version
- analysis_type: workflow analysis type

```
> db.FailedWorkflowRuns.find()
n/a
```

Displays all workflow runs that have gone from running > failed.

#### Donor Info
- donor_name: donor name
- institute: institute where the donor sample was originated from
- external_name: the external name of the donor
- donor_head: used to determine donor totals counts for a run or project

```
> db.DonorInfo.find()
{
  "_id": ObjectId("571667e5ba507b1cd348e43b"),
  "donor_name": "GECCO_6031",
  "institute": "n/a",
  "external_name": "110030017909",
  "donor_head": "GECCO"
}
```

#### Library Info
Note: Library Info documents refer to the **sequenced libraries** and not the general library. Information on the general library can be found by querying through the template_id or library name

- library_seqname: a combination of [run name || lane || template id] for uniqueness for a library seq (library on a sequencer run)
- template_id: the library id
- library_name: name of the library
- ProjectInfo_name: reference to project document in ProjectInfo collection
- RunInfo_name: reference to run document in RunInfo collection
- lane: lane library was sequenced on
- skip: boolean, whether or not the library was skipped
- create_tstmp: date the library was created
- prep_tstmp: date the sample for the library was prepared
- library_type: type of library
- tissue_type: type of tissue the library is from
- DonorInfo_id: reference to donor document in DonorInfo collection
- library_head: used to determine library totals counts for run
- tissue_origin: tissue where the sample originates from
- receive_tstmp: date when the donor sample was received 
- barcode: unique IUS tag/barcode of the sequenced library 
- WorkflowInfo_accession: array of workflows associated with the library seq
- iusswid: the ius SWID (seqware accession for the particular library seq)

```
> db.LibraryInfo.find()
{
  "_id": ObjectId("5717954eba507b1cd353a2d6"),
  "library_seqname": "111110_h1080_0084_AC08UPACXX||3||12788",
  "template_id": 12788,
  "library_name": "PCSI_0105_Ly_R_PE_384_EX",
  "ProjectInfo_name": "PCSI",
  "RunInfo_name": "111110_h1080_0084_AC08UPACXX",
  "lane": 3,
  "skip": 0,
  "create_tstmp": "2011-09-02 09:46:37",
  "prep_tstmp": "2011-08-15 11:46:46",
  "library_type": "EX",
  "tissue_type": "R",
  "DonorInfo_name": "PCSI_0105",
  "library_head": "PCSI",
  "tissue_origin": "PANCREAS:Partial Pancreatectomy",
  "receive_tstmp": "2012-04-02",
  "barcode": "TAGCTT",
  "WorkflowInfo_accession": [
    "638352",
    "2964658",
    "351593",
    "637530",
    "49886",
    "555438",
    "467298",
    "95666",
    "62458",
    "1715762",
    "50844",
    "178549",
    "711579",
    "424170",
    "1816935",
    "404355",
    "887340",
    "1662193"
  ],
  "iusswid": "16939"
}
```

#### Project Info
- project_name: project name
- start_tstmp: start date of the project

```
> db.ProjectInfo.find()
{
  "_id": ObjectId("57166874ba507b1cd3491f6d"),
  "project_name": "ACC",
  "start_tstmp": "2011-05-18 11:18:44"
}
```

#### Run Info
- run_name: run name
- start_tstmp: start date of sequencer run
- status: sequencer run status

```
> db.RunInfo.find()
{
  "_id": ObjectId("571669c7ba507b1cd349793f"),
  "run_name": "141120_SN7001205_0255_AHALRRADXX",
  "start_tstmp": "2014-11-25 09:40:51",
  "status": "Completed"
}
```

#### Workflow Info
- sw_accession: workflow SWID
- workflow_run_id: workflow run id given by seqware
- status: workflow run status
- status_cmd: oozie id
- start_tstmp: create date
- end_tstmp: last modified date
- workflow_name: workflow name and version
- analysis_type: workflow analysis type

```
> db.WorkflowInfo.find()
{
  "_id": ObjectId("571682cfba507b1cd34cbcbb"),
  "sw_accession": "2693076",
  "workflow_run_id": 161361,
  "status": "completed",
  "status_cmd": "0008012-150807151645068-oozie-oozi-W",
  "start_tstmp": "2015-09-17 12:01:24",
  "end_tstmp": "2015-09-17 12:20:36",
  "workflow_name": "BamQC_2.5",
  "analysis_type": "Quality Control"
}
```

#### File Info
- fileSWID: fileSWID
- file_path: path of file
- WorkflowInfo_accession: associated workflow SWID, references WorkflowInfo collection

```
> db.FileInfo.find()
{
  "_id": ObjectId("57166b89ba507b1cd349e3f0"),
  "fileSWID": "27470",
  "file_path": "/oicr/data/archive/i278/100913_I278_00018_62A2T_AP/Data/Intensities/Bustard1.8.0_27-09-2010_mchan/GERALD_27-09-2010_mchan/s_5_1_sequence.txt.gz",
  "WorkflowInfo_accession": "25831"
}

```

##### Example queries:
To query for all files associated with WorkflowInfo_id:

```
> db.FileInfo.find({"WorkflowInfo_id": "11805"})
{
  "_id": ObjectId("57166b89ba507b1cd349e404"),
  "fileSWID": "12047",
  "file_path": "/oicr/data/archive/seqware/seqware_analysis/results/seqware-0.10.0_IlluminaBaseCalling-1.8.2/913119/Unaligned_111028_h803_0070_BC087YACXX_2/Project_na/Sample_11783/11783_CGATGT_L002_R1_001.fastq.gz",
  "WorkflowInfo_accession": "11805"
}{
  "_id": ObjectId("57166b89ba507b1cd349e405"),
  "fileSWID": "12048",
  "file_path": "/oicr/data/archive/seqware/seqware_analysis/results/seqware-0.10.0_IlluminaBaseCalling-1.8.2/913119/Unaligned_111028_h803_0070_BC087YACXX_2/Project_na/Sample_11783/11783_CGATGT_L002_R2_001.fastq.gz",
  "WorkflowInfo_accession": "11805"
}{
  "_id": ObjectId("57166b89ba507b1cd349e406"),
  "fileSWID": "12055",
  "file_path": "/oicr/data/archive/seqware/seqware_analysis/results/seqware-0.10.0_IlluminaBaseCalling-1.8.2/913119/Unaligned_111028_h803_0070_BC087YACXX_2/Project_na/Sample_11779/11779_ACAGTG_L002_R1_001.fastq.gz",
  "WorkflowInfo_accession": "11805"
}
...
```

#### IUSSWIDReportData
- iusswid: ius SWID (seqware accession for the particular library seq)
- json details report data associated to the library seq

```
> db.IUSSWIDReportData.find()
{
  "_id": ObjectId("57168124ba507b1cd34c7081"),
  "Reads/SP": "3.09",
  "Map %": "87.94%",
  "Reads": 439354072,
  "Yield": 44374736694,
  "% on Target": "49.29%",
  "Insert Mean": "314.17",
  "Insert Stdev": "26.89",
  "Read Length": "101,101",
  "Coverage (collapsed)": "122.43",
  "Coverage (raw)": "378.32",
  "% Mouse Content": "N/A",
  "iusswid": "8060"
}
```

#### IUSSWIDRNASeqQCData
- iusswid: ius SWID (seqware accession for the particular library seq)
- rna seq qc details report data associated to the library seq

```
> db.IUSSWIDRNASeqQCData.find()
{
  "_id": ObjectId("57166b89ba507b1cd349e406"),
  "Bases Breakdown": <base64 image>,
  "RSeQC Gene Body Coverage": <base64 image>,
  "Junction Saturation": <base64 image>,
  "Total Reads": "95016984",
  "Uniq Reads": "6292051",
  "Reads/SP": "3.04",
  "Yield": "471903825",
  "Proportion Correct Strand Reads": "0.993366",
  "Median 5Prime to 3Prime Bias": "0.531538",
  "% rRNA Content": "4.18", 
  "iusswid":"1271373"
}
```

#### IUSSWIDGraphData
Note: Graphs are generated using Google charts and the data is in the format that is required for the function: drawGraphsById (found in functions.js) to plot graphs

- iusswid: ius SWID (seqware accession for the particular library seq)
- Read Breakdown: data required to plot read breakdown graph
- Insert Distribution: data required to plot insert distribution graph
- Soft Clip by Cycle: data required to plot soft clip by cycle graph
- Title: graph header title

```
> db.IUSSWIDGraphData.find()
{ "_id": ObjectId("57166f4aba507b1cd34ab444"), "iusswid": "9006", "Read Breakdown" : { "Colors" : [ "#878BB6", "#4ACAB4", "#FF8153", "#FFEA88" ], "Labels" : [ "Reads", "on target", "off target", "repeat/low quality", "unmapped" ], "Data" : [ "Number", 106723717, 47313717, 16706656, 16416403 ] }, "Insert Distribution" : { "x values" : [ { "label" : "Insert size", "id" : "Insert size", "type" : "number" }, "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "100", "101", "102", "103", "104", "105", "106", "107", "108", "109", "110", "111", "112", "113", "114", "115", "116", "117", "118", "119", "120", "121", "122", "123", "124", "125", "126", "127", "128", "129", "130", "131", "132", "133", "134", "135", "136", "137", "138", "139", "140", "141", "142", "143", "144", "145", "146", "147", "148", "149", "150", "151", "152", "153", "154", "155", "156", "157", "158", "159", "160", "161", "162", "163", "164", "165", "166", "167", "168", "169", "170", "171", "172", "173", "174", "175", "176", "177", "178", "179", "180", "181", "182", "183", "184", "185", "186", "187", "188", "189", "190", "191", "192", "193", "194", "195", "196", "197", "198", "199", "200", "201", "202", "203", "204", "205", "206", "207", "208", "209", "210", "211", "212", "213", "214", "215", "216", "217", "218", "219", "220", "221", "222", "223", "224", "225", "226", "227", "228", "229", "230", "231", "232", "233", "234", "235", "236", "237", "238", "239", "240", "241", "242", "243", "244", "245", "246", "247", "248", "249", "250", "251", "252", "253", "254", "255", "256", "257", "258", "259", "260", "261", "262", "263", "264", "265", "266", "267", "268", "269", "270", "271", "272", "273", "274", "275", "276", "277", "278", "279", "280", "281", "282", "283", "284", "285", "286", "287", "288", "289", "290", "291", "292", "293", "294", "295", "296", "297", "298", "299", "300", "301", "302", "303", "304", "305", "306", "307", "308", "309", "310", "311", "312", "313", "314", "315", "316", "317", "318", "319", "320", "321", "322", "323", "324", "325", "326", "327", "328", "329", "330", "331", "332", "333", "334", "335", "336", "337", "338", "339", "340", "341", "342", "343", "344", "345", "346", "347", "348", "349", "350", "351", "352", "353", "354", "355", "356", "357", "358", "359", "360", "361", "362", "363", "364", "365", "366", "367", "368", "369", "370", "371", "372", "373", "374", "375", "376", "377", "378", "379", "380", "381", "382", "383", "384", "385", "386", "387", "388", "389", "390", "391", "392", "393", "394", "395", "396", "397", "398", "399", "400", "401", "402", "403", "404", "405", "406", "407", "408", "409", "410", "411", "412", "413", "414", "415", "416", "417", "418", "419", "420", "421", "422", "423", "424", "425", "426", "427", "428", "429", "430", "431", "432", "433", "434", "435", "436", "437", "438", "439", "440", "441", "442", "443", "444", "445", "446", "447", "448", "449", "450", "451", "452", "453", "454", "455", "456", "457", "458", "459", "460", "461", "462", "463", "464", "465", "466", "467", "468", "469", "470", "471", "472", "473", "474", "475", "476", "477", "478", "479", "480", "481", "482", "483", "484", "485", "486", "487", "488", "489", "490", "491", "492", "493", "494", "495", "496", "497", "498", "499", "500", "501", "502", "503", "504", "505", "506", "507", "508", "509", "510", "511", "512", "513", "514", "515", "516", "517", "518", "519", "520", "521", "522", "523", "524", "525", "526", "527", "528", "529", "530", "531", "532", "533", "534", "535", "536", "537", "538", "539", "540", "541", "542", "543", "544", "545", "546", "547", "548", "549", "550", "551", "552", "553", "554", "555", "556", "557", "558", "559", "560", "561", "562", "563", "564", "565", "566", "567", "568", "569", "570", "571", "572", "573", "574", "575", "576", "577", "578", "579", "580", "581", "582", "583", "584", "585", "586", "587", "588", "589", "590", "591", "592", "593", "594", "595", "596", "597", "598", "599", "600", "601", "602", "603", "604", "605", "606", "607", "608", "609", "610", "611", "612", "613", "614", "615", "616", "617", "618", "619", "620", "621", "622", "623", "624", "625", "626", "627", "628", "629", "630", "631", "632", "633", "634", "635", "636", "637", "638", "639", "640", "641", "642", "643", "644", "645", "646", "647", "648", "649" ], "y values" : [ { "label" : "Pairs", "id" : "Pairs", "type" : "number" }, 1000, 0, 0, 1000, 1000, 1000, 0, 1000, 1000, 1000, 1000, 4000, 4000, 3000, 2000, 7000, 8000, 3000, 7000, 15000, 12000, 12000, 26000, 21000, 20000, 34000, 44000, 65000, 77000, 79000, 115000, 122000, 130000, 174000, 179000, 239000, 259000, 332000, 345000, 394000, 425000, 481000, 534000, 548000, 611000, 611000, 690000, 736000, 790000, 829000, 807000, 853000, 888000, 882000, 916000, 959000, 984000, 944000, 975000, 978000, 929000, 886000, 810000, 809000, 769000, 778000, 803000, 721000, 760000, 681000, 634000, 675000, 538000, 557000, 528000, 493000, 489000, 487000, 516000, 493000, 436000, 412000, 448000, 438000, 491000, 439000, 421000, 451000, 449000, 463000, 436000, 483000, 421000, 498000, 457000, 463000, 511000, 437000, 479000, 507000, 516000, 470000, 493000, 491000, 447000, 434000, 412000, 458000, 437000, 409000, 448000, 405000, 390000, 386000, 365000, 370000, 368000, 291000, 300000, 281000, 264000, 263000, 263000, 248000, 234000, 166000, 179000, 161000, 164000, 143000, 127000, 127000, 118000, 93000, 103000, 96000, 96000, 86000, 74000, 67000, 48000, 47000, 56000, 48000, 55000, 53000, 43000, 41000, 48000, 38000, 34000, 25000, 21000, 32000, 25000, 36000, 22000, 31000, 21000, 13000, 15000, 20000, 13000, 14000, 9000, 20000, 10000, 7000, 9000, 8000, 8000, 11000, 12000, 4000, 4000, 2000, 6000, 8000, 7000, 3000, 6000, 3000, 5000, 4000, 8000, 6000, 5000, 9000, 5000, 3000, 3000, 1000, 3000, 5000, 4000, 3000, 5000, 3000, 3000, 3000, 3000, 6000, 4000, 3000, 1000, 3000, 3000, 3000, 1000, 3000, 1000, 2000, 2000, 2000, 1000, 3000, 3000, 2000, 2000, 2000, 2000, 5000, 3000, 2000, 3000, 1000, 2000, 1000, 0, 1000, 1000, 1000, 4000, 1000, 2000, 2000, 2000, 0, 2000, 2000, 1000, 3000, 1000, 0, 2000, 0, 1000, 1000, 2000, 1000, 0, 3000, 1000, 0, 0, 1000, 1000, 0, 0, 0, 3000, 0, 0, 0, 1000, 0, 1000, 1000, 0, 1000, 0, 2000, 0, 0, 0, 1000, 1000, 0, 0, 0, 0, 0, 1000, 0, 2000, 0, 0, 0, 0, 0, 0, 1000, 0, 2000, 0, 1000, 0, 0, 0, 0, 0, 0, 0, 0, 2000, 0, 0, 1000, 0, 0, 0, 0, 0, 0, 0, 0, 1000, 1000, 0, 0, 0, 0, 0, 0, 1000, 0, 0, 0, 1000, 1000, 1000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1000, 0, 1000, 0, 0, 0, 1000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1000, 0, 0, 0, 0, 0, 1000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], "Colors" : [ { "type" : "string", "role" : "style" }, "#A6FF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D" ] }, "Soft Clip by Cycle" : { "x values" : [ { "label" : "Cycle", "id" : "Cycle", "type" : "number" }, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 101, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203 ], "y values" : [ { "label" : "% Bases Soft Clipped", "id" : "% Bases Soft Clipped", "type" : "number" }, 0.30445096098171426, 0.2073255010366275, 0.09338986533181419, 0.08591867610526906, 0.07657968957208763, 0.06537290573226993, 0.06163731111899737, 0.054166121892452235, 0.046694932665907095, 0.04295933805263453, 0.039223743439361955, 0.03735594613272568, 0.03735594613272568, 0.035488148826089395, 0.026149162292907972, 0.026149162292907972, 0.02428136498627169, 0.02428136498627169, 0.020545770372999123, 0.01867797306636284, 0.016810175759726556, 0.020545770372999123, 0.029884756906180542, 0.03735594613272568, 0.054166121892452235, 0.11953902762472217, 0.12327462223799474, 0.14008479799772128, 0.1606305683707204, 0.21292889295653636, 0.27830179868880633, 0.3007153663684417, 0.3249967313547134, 0.36048488018080277, 0.41653435941498407, 0.5510207893606291, 0.5715780035863718, 0.6201550387596899, 0.661286707016364, 0.771529983186998, 0.9920227175070526, 1.0219905461203593, 1.0706678126985314, 1.1660282163879285, 1.3062978882451879, 1.721398800067286, 1.792590377210363, 1.899278423748458, 2.0250939621159705, 2.3282778224524527, 2.927312857730725, 2.9790419161676644, 3.097568736079657, 3.2974440595449863, 3.713627250754155, 4.582442719466007, 4.704248089955135, 4.884560427164022, 5.170595767116065, 5.768940537277392, 6.878226828299638, 6.977361495582269, 7.16595647542231, 7.499856872960439, 8.156850719665753, 9.370844975431158, 9.491328359655073, 9.70669164568819, 10.004914971001671, 10.757185332011893, 12.175061535690702, 12.296988451348016, 12.46803199869059, 12.82051282051282, 13.384469895975624, 14.579291820332985, 14.70352477306701, 14.886531548419823, 15.141445891333632, 15.97271499530753, 17.421220814965128, 17.66301761066159, 17.987552875966355, 18.663250584548035, 19.949572127139366, 22.441890833115696, 22.741866438356166, 23.21737459158178, 24.035692099169818, 25.91358275132582, 29.82221429420859, 30.132723112128147, 30.679933665008292, 31.70966191315494, 34.026179043609815, 38.70869755982314, 39.18255942509674, 39.66458658346334, 40.650909090909096, 42.42051511424205, 45.9206658267476, 0, 0.601684717208183, 0.36853188929001207, 0.22751203369434417, 0.21623044524669072, 0.1861462093862816, 0.16734356197352587, 0.1523014440433213, 0.13161853188929, 0.11281588447653429, 0.09213297232250302, 0.08085138387484958, 0.07521058965102287, 0.06204873646209386, 0.054527677496991576, 0.048886883273164865, 0.043246089049338146, 0.03572503008423586, 0.030084235860409148, 0.028203971119133572, 0.026323706377858, 0.02256317689530686, 0.026323706377858, 0.033844765342960284, 0.04512635379061372, 0.052647412755716, 0.09213297232250302, 0.10153429602888085, 0.105294825511432, 0.12409747292418773, 0.14854091456077015, 0.18426594464500604, 0.1917870036101083, 0.197427797833935, 0.21623044524669072, 0.26323706377858, 0.34596871239470517, 0.35537003610108303, 0.3685596088755171, 0.3930122792831757, 0.44570654831308537, 0.5435293675123657, 0.5566944386977863, 0.5905696928661438, 0.6357326913310889, 0.7147962830593281, 0.8804274211754082, 0.9011720881229658, 0.9351773449995295, 0.9919066440805572, 1.088102409638554, 1.3105123425408123, 1.3487802580766695, 1.4002487655949645, 1.4820401621570662, 1.5998490708423734, 1.895841987990483, 1.9562998525687068, 2.0495836487509465, 2.2215903705809876, 2.4943956837265855, 2.9878315845600136, 3.09034339269694, 3.215674257368854, 3.4716749005209433, 3.923840420190785, 4.761257763975156, 4.9264547887406485, 5.110910092031778, 5.375406326805677, 5.981076593786882, 7.0972693488447245, 7.280522662311148, 7.536578822461151, 8.007522724898129, 8.82097733381304, 10.19452913642805, 10.439944134078212, 10.748752079866888, 11.367332188996295, 12.460872767446142, 14.246485319313729, 14.600709423832805, 15.054684250446526, 15.770779659321143, 17.013213151695176, 19.327510687963912, 19.623453469607316, 20.15523146613634, 21.037709101219164, 22.919520797504884, 26.324755671119878, 26.717510490367243, 27.38016658808738, 28.59491875161207, 30.625867424492764, 34.54884667571235, 34.9446263146897, 35.70534149046546, 37.02360011726766, 39.64676766161692, 45.10639932396097 ] }, "Title" : "110217_SN203_0104_B81CDEABXX Lane: 1 Barcode: NoIndex Library: PCSI_0010_Pa_P_PE_246_EX"}
```

#### Run Report Data
- run_name: run name
- lane_#: run lane details 

```
> db.RunReportData.find()
{
  "_id": ObjectId("57167a15ba507b1cd34bf2ef"),
  "lane_8": {
    "Phasing (R1/R2)": "0.22/0.26",
    "PF% Sequencing": "93.60",
    "Prephasing (R1/R2)": "0.25/0.31"
  },
  "lane_1": {
    "Phasing (R1/R2)": "0.32/0.25",
    "PF% Sequencing": "94.31",
    "Prephasing (R1/R2)": "0.25/0.28"
  },
  "run_name": "160115_D00353_0124_BC8L4BANXX",
  "lane_7": {
    "Phasing (R1/R2)": "0.27/0.23",
    "PF% Sequencing": "95.67",
    "Prephasing (R1/R2)": "0.16/0.32"
  },
  "lane_4": {
    "Phasing (R1/R2)": "0.19/0.28",
    "PF% Sequencing": "92.48",
    "Prephasing (R1/R2)": "0.26/0.32"
  },
  "lane_2": {
    "Phasing (R1/R2)": "0.34/0.30",
    "PF% Sequencing": "95.73",
    "Prephasing (R1/R2)": "0.27/0.33"
  },
  "lane_5": {
    "Phasing (R1/R2)": "0.21/0.26",
    "PF% Sequencing": "94.55",
    "Prephasing (R1/R2)": "0.31/0.39"
  },
  "lane_6": {
    "Phasing (R1/R2)": "0.23/0.27",
    "PF% Sequencing": "93.86",
    "Prephasing (R1/R2)": "0.29/0.37"
  },
  "lane_3": {
    "Phasing (R1/R2)": "0.35/0.30",
    "PF% Sequencing": "95.70",
    "Prephasing (R1/R2)": "0.26/0.34"
  }
}
```

### Approximate Time Totals
This table demonstrates the dependencies of collection updates on download times, hold times, and general function run time and returns a column of total time it takes to update the collection.

|                      | Download time (s) |                    |                     |                 | Hold time (s) |             | Run time (s) | Total time (s) | Human time |
|----------------------|-------------------|--------------------|---------------------|-----------------|---------------|-------------|--------------|----------------|------------|
|                      | pinery/runs.out   | pinery/samples.out | pinery/projects.out | psql seqware db | PerlFPR       | LibraryInfo |              |                |            |
| CurrentWorkflowRuns  |                   |                    |                     |                 |               |             | 5            | 5              | 5s         |
| DonorInfo            | 10                | 40                 |                     |                 |               |             | 15           | 65             | 1m 5s      |
| FileInfo             |                   |                    |                     |                 | 60            |             | 60           | 120            | 2m         |
| IUSSWIDGraphData     |                   |                    |                     |                 | 60            |             | 896          | 956            | 16m        |
| IUSSWIDRNASeqQCData  |                   |                    |                     |                 | 60            |             | 270          | 330            | 5m 30s     |
| IUSSWIDReportData    |                   |                    |                     |                 | 60            |             | 860          | 920            | 5m 20s     |
| LibraryInfo          | 10                | 40                 |                     | 2               |               |             | 10           | 62             | 1m 2s      |
| ProjectInfo          | 10                | 40                 | 32                  | 2               |               |             | 2            | 86             | 1m 26s     |
| RunInfo              |                   |                    |                     |                 |               |             | 13           | 13             | 13s        |
| RunReportData        |                   |                    |                     |                 |               |             | 3600         | 3600           | 60m        |
| WorkflowInfo         |                   |                    |                     |                 |               | 62          | 83           | 145            | 2m 25s     |


### Workflow Run Analysis YAML
This is used to sort the workflow into its respective analysis type