seqware-browser
================
Next gen seqware browser calls for foundational code that will parse data from data sources and update seqware data in a mongodb database, which can then be called by the frontend to populate the web pages with relevant data.

Data is collected from these main data sources: 
- seqware postgres database
- pinery webservice
- file provenance report
- json reports and directories (file sources)

Mongo databases are organized by database > collections > documents in the collection

At the time of this edit, the mongo database name is seqwareBrowser and the collections are organized according to major categories: Project, Donor, Sequencer Run, Library Seq (same as IUS) , Workflow, Files, Dates, all the associated report data for a specific library, and currently running sequencer runs and running/failed workflow runs.

The documents within the collection each have their own '_id'. Each _id format is different based on the collection and determines a document's uniqueness within the collection. They can be used to query documents effectively. The most common query to get back all documents is db.[collection].find() and the first 20 documents within that collection are displayed.

To view the collections:
Log into the mongo server.

```
$ mongo
> use seqwareBrowser
> show collections
```

- [CurrentSequencerRuns](#current-sequencer-runs)
- [CurrentWorkflowRuns](#current-workflow-runs)
- [DateInfo](#date-info)
- [DonorInfo](#donor-info)
- [FilesInfo](#file-info)
- [IUSSWIDGraphData](#iusswidgraphdata)
- [IUSSWIDRNASeqQCData](#iusswidrnaseqqcdata)
- [IUSSWIDReportData](#iusswidreportdata)
- [LibraryInfo](#library-info)
- [ProjectInfo](#project-info)
- [ReportRunData](#report-run-data)
- [RunInfo](#run-info)
- [RunReportDataPhasing](#run-report-data-phasing)
- [WorkflowInfo](#workflow-info)

### Collections

#### Current Sequencer Runs
- _id: run name
- created_date: start date of run
- status: sequencer run status

```
> db.CurrentSequencerRuns.find()
{
  "_id": "160219_D00331_0178_BC8BTHANXX",
  "created_date": "2016-02-19 15:42:13",
  "status": "Running"
}{
  "_id": "160315_D00355_0113_BC8KRBANXX",
  "created_date": "2016-03-15 14:02:11",
  "status": "Running"
}{
  "_id": "160329_D00331_0184_AC8KL5ANXX",
  "created_date": "2016-03-30 09:42:48",
  "status": "Running"
}
...
```

Displays all currently running sequencer runs before the date 2014-02-01.

Runs a query in seqware database for all completed sequencer runs after 2014-02-01 and compares the output to the running sequencer runs from pinery. If the sequencer is 'running' in pinery but appears in seqware database, the sequencer run is complete so the entry is removed from the CurrentSequencerRuns collection.

Failed sequencer runs don't appear in seqware database so if the status is failed on pinery, the status is updated as failed in the RunInfo collection.

#### Current Workflow Runs
- _id: workflow SWID (or sw accession)
- sw_accession: seqware accession id
- workflow_run_id: workflow run id given by seqware
- status: workflow run status
- status_cmd: oozie id
- create_tstmp: create date
- last_modified: last modified date
- name: workflow name
- version: workflow version
- template_id: array of templates (libraries) associated with this workflow
- runinfo_id: an array of sequencer run names associated with this workflow 
- libraryinfo_id: an array of library info ids associated with this workflow run
- analysis_type: workflow analysis type
- workflow_name: workflow name and version

```
> db.CurrentWorkflowRuns.find()
{
  "_id": 3447739,
  "sw_accession": 3447739,
  "workflow_run_id": 201890,
  "status": "running",
  "status_cmd": "0000720-160202125311466-oozie-oozi-W",
  "create_tstmp": "2016-03-21 10:45:40",
  "last_modified": "2016-03-21 14:46:04",
  "name": "CASAVA",
  "version": "2.8",
  "template_id": [
    "12850"
  ],
  "runinfo_id": [
    "110916_SN804_0064_AD04TBACXX"
  ],
  "libraryinfo_id": [
    "110916_SN804_0064_AD04TBACXX||4||12850"
  ],
  "analysis_type": "Base calling",
  "workflow_name": "CASAVA_2.8"
}{
  "_id": 3439497,
  "sw_accession": 3439497,
  "workflow_run_id": 201817,
  "status": "running",
  "status_cmd": "0000629-160202125311466-oozie-oozi-W",
  "create_tstmp": "2016-03-15 15:43:45",
  "last_modified": "2016-03-15 19:44:02",
  "name": "CASAVA",
  "version": "2.8",
  "template_id": [
    "12850"
  ],
  "runinfo_id": [
    "110916_SN804_0064_AD04TBACXX"
  ],
  "libraryinfo_id": [
    "110916_SN804_0064_AD04TBACXX||4||12850"
  ],
  "analysis_type": "Base calling",
  "workflow_name": "CASAVA_2.8"
}{
  "_id": 3452851,
  "sw_accession": 3452851,
  "workflow_run_id": 201918,
  "status": "running",
  "status_cmd": "0000756-160202125311466-oozie-oozi-W",
  "create_tstmp": "2016-03-22 10:46:37",
  "last_modified": "2016-03-22 15:04:23",
  "name": "CASAVA",
  "version": "2.8",
  "template_id": [
    "12850"
  ],
  "runinfo_id": [
    "110916_SN804_0064_AD04TBACXX"
  ],
  "libraryinfo_id": [
    "110916_SN804_0064_AD04TBACXX||4||12850"
  ],
  "analysis_type": "Base calling",
  "workflow_name": "CASAVA_2.8"
}
...
```

Displays all currently running workflow runs

Runs a query in seqware database for all workflow runs with status = 'running' and adds to CurrentWorkflowRuns collection. 

The _id for all documents in the CurrentWorkflowRuns collection are also queried for and if the status changes, the document is removed from the collection and updated in WorkflowInfo collection and other associated collections that require Workflow data. If the status = 'failed', the document is added to a FailedWorkflowRuns collection.

#### Failed Workflow Runs
- _id: workflow SWID (or sw accession)
- sw_accession: seqware accession id
- workflow_run_id: workflow run id given by seqware
- status: workflow run status
- status_cmd: oozie id
- create_tstmp: create date
- last_modified: last modified date
- name: workflow name
- version: workflow version
- template_id: array of templates (libraries) associated with this workflow
- runinfo_id: an array of sequencer run names associated with this workflow 
- libraryinfo_id: an array of library info ids associated with this workflow run
- analysis_type: workflow analysis type
- workflow_name: workflow name and version

```
> db.FailedWorkflowRuns.find()
n/a
```

Displays all workflow runs that have gone from running > failed.

#### Date Info
- _id: date
- LibraryInfo_id: array of libraries that have 'last modified date' workflows occurring on that date
- RunInfo_id: array of runs with libraries that have had 'last modified date' workflows running on them on that date
- WorkflowInfo_id: array of workflows that occurred on that date
- num_complete_workflows: number of completed workflows on that date
- num_runs: total sequencer runs count on that date
- num_libraries: number of libraries with workflows run on them on that date
- num_workflows: number of workflows on that date

```
> db.DateInfo.find()
{
  "_id": "2012-05-24",
  "LibraryInfo_id": [
    "120413_SN802_0082_BC0M4AACXX||8||18337",
    "120511_SN1080_0107_AD0VMLACXX||4||19275",
    "120511_SN1080_0107_AD0VMLACXX||6||19279",
    "120413_SN802_0082_BC0M4AACXX||6||18333",
    "120511_SN1080_0107_AD0VMLACXX||2||19270",
    "120511_SN1080_0107_AD0VMLACXX||5||19277",
    "120413_SN802_0082_BC0M4AACXX||7||18335",
    "120511_SN1080_0107_AD0VMLACXX||3||19273",
    "120412_h1179_0073_BC075RACXX||2||18675"
  ],
  "RunInfo_id": [
    "120413_SN802_0082_BC0M4AACXX",
    "120511_SN1080_0107_AD0VMLACXX",
    "120412_h1179_0073_BC075RACXX"
  ],
  "WorkflowInfo_id": [
    215476,
    215451,
    215447,
    215475,
    215449,
    215452,
    215474,
    215448,
    215471
  ],
  "num_complete_workflows": 9,
  "num_runs": 3,
  "num_libraries": 9,
  "num_workflows": 9
}
```

Displays all date documents and all associated libraries and runs data that have had workflow runs occurring on that date.

The RunInfo_id and LibraryInfo_id references the RunInfo collection and the LibraryInfo collection.

functions: updateWorkflowInfo

#### Donor Info
- _id: Donor name
- LibraryInfo_id: array of LibraryInfo_id documents associated with that donor
- libraries: array of libraries associated with the donor
- institute: institute where the donor sample was originated from
- status: sequencer run status
- skipped_libraries: number of skipped libraries for this donor
- library_total: total number of library seqs
- library_types: count for libraries per type of sequenced library
- tissue_types: count for libraries per tissue type

```
> db.DonorInfo.find({_id: "PCSI_0139"})
{
  "_id": "PCSI_0139",
  "LibraryInfo_id": [
    "111130_h801_0064_AC043YACXX||5||15291",
    "111212_h1080_0086_AC045BACXX||8||15545",
    "111209_h239_0135_BD0GRMACXX||4||15291",
    "120106_h804_0076_AD0LFWACXX||8||15545",
    "120215_SN1080_0099_AC0GHPACXX||2||17304"
  ],
  "libraries": [
    "PCSI_0139_Ly_R_PE_393_EX",
    "PCSI_0139_Pa_X_PE_425_EX",
    "PCSI_0139_Pa_X_PE_427_EX"
  ],
  "institute": "Mayo Clinic",
  "status": "Completed",
  "skipped_libraries": 1,
  "library_total": 5,
  "library_types": {
    "EX": 5
  },
  "tissue_types": {
    "R": 2,
    "X": 3
  }
}
```

Displays all information associated with a particular donor, you can either query for the donor by name or just do db.Donor.find() for all donors

The LibraryInfo_id array references the LibraryInfo collection: see below

functions: updateDonorInfo

#### Library Info
Note: Library Info documents refer to the **sequenced libraries** and not the general library. Information on the general library can be found by querying through the template_id or library name

- _id: a combination of [run name || lane || template id] for uniqueness for a library seq (library on a sequencer run)
- template_id: the library id
- library_name: name of the library
- ProjectInfo_id: reference to project document in ProjectInfo collection
- RunInfo_id: reference to run document in RunInfo collection
- lane: lane library was sequenced on
- status: sequencer run status
- skip: boolean, whether or not the library was skipped
- create_date: date the library was created
- prep_date: date the sample for the library was prepared
- library_type: type of library
- tissue_type: type of tissue the library is from
- DonorInfo_id: reference to donor document in DonorInfo collection
- institute: institute where the donor sample came from
- tissue_origin: tissue where the sample originates from
- receive_date: date when the donor sample was received 
- barcode: unique IUS tag/barcode of the sequenced library 
- WorkflowInfo_id: array of workflows associated with the library seq
- iusswid: the ius SWID (seqware accession for the particular library seq)
- analysis_total: total number of workflows and their statuses under their respective analysis type
- num_workflows: number of workflows performed on this library seq

```
> db.LibraryInfo.find()
{
  "_id": "121108_SN802_0094_AD1DD8ACXX||3||25038",
  "template_id": 25038,
  "library_name": "AOE_0012_Pa_C_PE_730_WG",
  "ProjectInfo_id": "AOE",
  "RunInfo_id": "121108_SN802_0094_AD1DD8ACXX",
  "lane": 3,
  "status": "Completed",
  "skip": 0,
  "create_date": "2012-11-05 15:51:19",
  "prep_date": "2012-08-31 10:46:26",
  "library_type": "WG",
  "tissue_type": "C",
  "DonorInfo_id": "AOE_0012",
  "institute": "n/a",
  "tissue_origin": "Pa",
  "receive_date": "2012-08-22",
  "barcode": "noIndex",
  "WorkflowInfo_id": [
    467927,
    399167,
    464529,
    1706844,
    2056628,
    342931,
    438218,
    543372,
    600000,
    1529562,
    340888,
    2897931,
    458889
  ],
  "iusswid": "322947",
  "analysis_total": {
    "Quality Control": {
      "failed": 3,
      "completed": 8
    },
    "Alignment": {
      "completed": 1
    },
    "Base calling": {
      "completed": 1
    }
  },
  "num_workflows": 13
}
```

Displays all information associated with a particular library

functions: updateLibraryInfo, updateWorkflowInfo

##### Example queries:
Get all Libraries for a run:

```
> db.LibraryInfo.find({"RunInfo_id":"110114_H239_0105_A81CK4ABXX"})
{
  "_id": "110114_H239_0105_A81CK4ABXX||7||6155",
  "template_id": 6155,
  "library_name": "FCSG_0004_Li_P_PE_300_EX",
  "ProjectInfo_id": "FCSG",
  "RunInfo_id": "110114_H239_0105_A81CK4ABXX",
  "lane": 7,
  "status": "Completed",
  "skip": 0,
  "create_date": "2010-12-07 13:36:50",
  "prep_date": "2010-11-23 15:06:26",
  "library_type": "EX",
  "tissue_type": "P",
  "DonorInfo_id": "FCSG_0004",
  "receive_date": "n/a",
  "barcode": "noIndex",
  "WorkflowInfo_id": [
    25831
  ],
  "iusswid": "8176",
  "analysis_total": {
    "Base calling": {
      "completed": 1
    }
  },
  "num_workflows": 1
}{
  "_id": "110114_H239_0105_A81CK4ABXX||6||6220",
  "template_id": 6220,
  "library_name": "FCSG_0003_Li_P_PE_300_EX",
  "ProjectInfo_id": "FCSG",
  "RunInfo_id": "110114_H239_0105_A81CK4ABXX",
  "lane": 6,
  "status": "Completed",
  "skip": 0,
  "create_date": "2010-12-17 16:13:36",
  "prep_date": "2010-12-17 15:02:16",
  "library_type": "EX",
  "tissue_type": "P",
  "DonorInfo_id": "FCSG_0003",
  "receive_date": "n/a",
  "barcode": "noIndex",
  "WorkflowInfo_id": [
    25831
  ],
  "iusswid": "8174",
  "analysis_total": {
    "Base calling": {
      "completed": 1
    }
  },
  "num_workflows": 1
}
...
```

Get all libraries for a project:

```
> db.LibraryInfo.find({"ProjectInfo_id": "TLCR"})
{
  "_id": "110512_SN803_0045_B808NNABXX||8||7967",
  "template_id": 7967,
  "library_name": "TLCR_4R12_nn_n_PE_500_WG",
  "ProjectInfo_id": "TLCR",
  "RunInfo_id": "110512_SN803_0045_B808NNABXX",
  "lane": 8,
  "status": "Completed",
  "skip": 0,
  "create_date": "2011-04-11 11:07:17",
  "prep_date": "2011-04-11 11:04:51",
  "library_type": "WG",
  "tissue_type": "n",
  "DonorInfo_id": "TLCR_4R12",
  "receive_date": "n/a",
  "barcode": "CTTGTA",
  "WorkflowInfo_id": [
    25831
  ],
  "iusswid": "9759",
  "analysis_total": {
    "Base calling": {
      "completed": 1
    }
  },
  "num_workflows": 1
}{
  "_id": "110415_SN203_0106_B816EVABXX||8||7965",
  "template_id": 7965,
  "library_name": "TLCR_4R10_nn_n_PE_500_WG",
  "ProjectInfo_id": "TLCR",
  "RunInfo_id": "110415_SN203_0106_B816EVABXX",
  "lane": 8,
  "status": "Completed",
  "skip": 0,
  "create_date": "2011-04-11 11:07:17",
  "prep_date": "2011-04-11 11:04:51",
  "library_type": "WG",
  "tissue_type": "n",
  "DonorInfo_id": "TLCR_4R10",
  "receive_date": "n/a",
  "barcode": "TAGCTT",
  "WorkflowInfo_id": [
    394273,
    25831
  ],
  "iusswid": "9762",
  "analysis_total": {
    "Base calling": {
      "completed": 2
    }
  },
  "num_workflows": 2
}
...
```

Get all libraries for a donor:

```
> db.LibraryInfo.find({"DonorInfo_id": "PCSI_0001"})
{
  "_id": "110401_SN393_0121_A81CGEABXX||6||5114",
  "template_id": 5114,
  "library_name": "PCSI_0001_Ly_R_PE_400_EX",
  "ProjectInfo_id": "PCSI",
  "RunInfo_id": "110401_SN393_0121_A81CGEABXX",
  "lane": 6,
  "status": "Completed",
  "skip": 0,
  "create_date": "2010-10-27 14:40:19",
  "prep_date": "2010-08-30 15:26:57",
  "library_type": "EX",
  "tissue_type": "R",
  "DonorInfo_id": "PCSI_0001",
  "institute": "n/a",
  "tissue_origin": "Ly",
  "receive_date": "n/a",
  "barcode": "noIndex",
  "WorkflowInfo_id": [
    134082,
    636716,
    2892505,
    1630217,
    848301,
    114079,
    636708,
    635879,
    25831,
    416141,
    1691082,
    453505,
    1793545,
    33247,
    431729,
    554942,
    638355
  ],
  "iusswid": "9081",
  "analysis_total": {
    "Variant Calling": {
      "completed": 8
    },
    "Quality Control": {
      "completed": 6
    },
    "Base calling": {
      "completed": 2
    },
    "Alignment": {
      "completed": 1
    }
  },
  "num_workflows": 17
}{
  "_id": "110406_SN801_0045_AB07R4ABXX||2||7921",
  "template_id": 7921,
  "library_name": "PCSI_0001_Pa_X_PE_193_EX",
  "ProjectInfo_id": "PCSI",
  "RunInfo_id": "110406_SN801_0045_AB07R4ABXX",
  "lane": 2,
  "status": "Completed",
  "skip": 0,
  "create_date": "2011-03-01 14:01:34",
  "prep_date": "2010-08-30 15:51:51",
  "library_type": "EX",
  "tissue_type": "X",
  "DonorInfo_id": "PCSI_0001",
  "institute": "n/a",
  "tissue_origin": "Ly",
  "receive_date": "n/a",
  "barcode": "noIndex",
  "WorkflowInfo_id": [
    134082,
    1691073,
    636716,
    416291,
    636708,
    635879,
    1793536,
    25831,
    453505,
    1629690,
    561492,
    395373,
    2892442,
    33247,
    431729,
    638355
  ],
  "iusswid": "9092",
  "analysis_total": {
    "Variant Calling": {
      "completed": 7
    },
    "Quality Control": {
      "completed": 5
    },
    "Alignment": {
      "completed": 1
    },
    "Base calling": {
      "completed": 3
    }
  },
  "num_workflows": 16
}
...
```

#### Project Info
- _id: project acronym
- start_date: start date of the project
- last_mod: last modified date
- DonorInfo_id: donors associated with the project, referenced to DonorInfo collection
- LibraryInfo_id: library seqs associated with the project, referenced to LibraryInfo collection
- RunInfo_id: sequencer runs associated with the project, referenced to RunInfo collection
- num_runs: number of sequencer runs
- num_libraries: number of libraries
- donor_totals: number of donors with that donor head (first section of donor name)
- num_donors: number of donors

```
> db.ProjectInfo.find()
{
  "_id": "DCR",
  "start_date": "2012-08-17 16:28:25",
  "last_mod": "2012-08-31 14:52:40",
  "DonorInfo_id": [
    "DCR_0001",
    "DCR_0002",
    "DCR_0003",
    "DCR_0004",
    "DCR_0005",
    "DCR_0006",
    "DCR_0007",
    "DCR_0008"
  ],
  "LibraryInfo_id": [
    "120905_h803_0094_BD184RACXX||2||23389",
    "120905_h803_0094_BD184RACXX||3||23393",
    "120905_h803_0094_BD184RACXX||7||23409",
    "120905_h803_0094_BD184RACXX||6||23405",
    "120905_h803_0094_BD184RACXX||1||23385",
    "120905_h803_0094_BD184RACXX||5||23401",
    "120905_h803_0094_BD184RACXX||4||23397",
    "120905_h803_0094_BD184RACXX||8||23413",
    "120905_SN1080_0117_BC0TFVACXX||7||23407",
    "120905_SN1080_0117_BC0TFVACXX||8||23411",
    "120905_SN1080_0117_BC0TFVACXX||1||23383",
    "120905_SN1080_0117_BC0TFVACXX||6||23403",
    "120905_SN1080_0117_BC0TFVACXX||3||23391",
    "120905_SN1080_0117_BC0TFVACXX||2||23387",
    "120905_SN1080_0117_BC0TFVACXX||4||23395",
    "120905_SN1080_0117_BC0TFVACXX||5||23399"
  ],
  "RunInfo_id": [
    "120905_h803_0094_BD184RACXX",
    "120905_SN1080_0117_BC0TFVACXX"
  ],
  "num_runs": 2,
  "num_libraries": 16,
  "donor_totals": {
    "DCR": 8
  },
  "num_donors": 8
}
```

Lists information for a specified project

functions: updateProjectInfo

#### Run Info
- _id: run name
- start_date: start date of sequencer run
- status: sequencer run status
- LibraryInfo_id: library seqs associated with that sequencer run
- skipped_libraries: number of skipped libraries for this run
- library_types: number of library seqs with a particular library type
- tissue_types: number of library seqs with a particular tissue type
- library_totals: number of libraries organized by head of name
- donors: number of libraries associated with a donor on that run
- donor_totals: number of donors organized by head of donor name
- libraries: array of libraries on this sequencer run
- projects: number of library seqs associated with a particular project
- num_libraries: number of libraries on this run
- analysis_total: total number of workflows and their statuses under their respective analysis type

```
> db.RunInfo.find()
{
  "_id": "140110_SN804_0172_BC3KBVACXX",
  "start_date": "2014-01-30 15:54:32",
  "status": "Completed",
  "LibraryInfo_id": [
    "140110_SN804_0172_BC3KBVACXX||5||49666",
    "140110_SN804_0172_BC3KBVACXX||8||49665",
    "140110_SN804_0172_BC3KBVACXX||1||52424",
    "140110_SN804_0172_BC3KBVACXX||3||49671",
    "140110_SN804_0172_BC3KBVACXX||2||52424",
    "140110_SN804_0172_BC3KBVACXX||7||49680",
    "140110_SN804_0172_BC3KBVACXX||6||49668",
    "140110_SN804_0172_BC3KBVACXX||4||49678"
  ],
  "skipped_libraries": 5,
  "library_types": {
    "MR": 6,
    "WG": 2
  },
  "tissue_types": {
    "P": 2,
    "F": 2,
    "R": 2,
    "M": 2
  },
  "library_totals": {
    "ASHPC": 8
  },
  "donors": {
    "ASHPC_0018": 2,
    "ASHPC_0026": 2,
    "ASHPC_0020": 1,
    "ASHPC_0024": 2,
    "ASHPC_0019": 1
  },
  "donor_totals": {
    "ASHPC": 5
  },
  "libraries": [
    "ASHPC_0018_Pa_P_PE_500_MR",
    "ASHPC_0018_Pa_F_PE_500_MR",
    "ASHPC_0026_Pa_R_PE_792_WG",
    "ASHPC_0020_Pa_F_PE_500_MR",
    "ASHPC_0026_Pa_R_PE_792_WG",
    "ASHPC_0024_Pa_M_PE_500_MR",
    "ASHPC_0019_Pa_M_PE_500_MR",
    "ASHPC_0024_Pa_P_PE_500_MR"
  ],
  "projects": {
    "ASHPC": 8
  },
  "num_libraries": 8,
  "analysis_total": {
    "Quality Control": {
      "completed": 21
    },
    "Alignment": {
      "completed": 4
    },
    "Base calling": {
      "completed": 3
    }
  }
}
```

Lists information for a specified run

*Only captures those libraries with sample_type ending in library Seq (from pinery)

functions: updateRunInfo, updateWorkflowInfo

#### Workflow Info
- _id: workflow SWID (or sw accession)
- sw_accession: seqware accession id
- workflow_run_id: workflow run id given by seqware
- status: workflow run status
- status_cmd: oozie id
- create_tstmp: create date
- last_modified: last modified date
- name: workflow name
- version: workflow version
- template_id: array of templates (libraries) associated with this workflow
- runinfo_id: an array of sequencer run names associated with this workflow 
- libraryinfo_id: an array of library info ids associated with this workflow run
- analysis_type: workflow analysis type
- workflow_name: workflow name and version

```
> db.WorkflowInfo.find()
{
  "_id": 2693076,
  "sw_accession": 2693076,
  "workflow_run_id": 161361,
  "status": "completed",
  "status_cmd": "0008012-150807151645068-oozie-oozi-W",
  "create_tstmp": "2015-09-17 12:01:24",
  "last_modified": "2015-09-17 12:20:36",
  "name": "BamQC",
  "version": "2.5",
  "template_id": [
    "83083"
  ],
  "runinfo_id": [
    "150911_D00331_0139_AC7HN0ANXX"
  ],
  "libraryinfo_id": [
    "150911_D00331_0139_AC7HN0ANXX||8||83083"
  ],
  "analysis_type": "Quality Control",
  "workflow_name": "BamQC_2.5"
}
```

Provides information on workflows

functions: updateWorkflowInfo

#### File Info
- _id: fileSWID
- file_path: path of file
- WorkflowInfo_id: associated workflow SWID, references WorkflowInfo collection

```
> db.FileInfo.find()
{
  "_id": "12017",
  "file_path": "/oicr/data/archive/seqware/seqware_analysis/results/seqware-0.10.0_IlluminaBaseCalling-1.8.2/70453881/Unaligned_111028_SN393_0192_BC0AAKACXX_2/Project_na/Sample_11720/11720_TAGCTT_L002_R1_001.fastq.gz",
  "WorkflowInfo_id": "11804"
}

```
List of files linked to associated workflow

functions: updateFilesInfo

##### Example queries:
To query for all files associated with WorkflowInfo_id:

```
> db.FileInfo.find({"WorkflowInfo_id": "11805"})
{
  "_id": "12047",
  "file_path": "/oicr/data/archive/seqware/seqware_analysis/results/seqware-0.10.0_IlluminaBaseCalling-1.8.2/913119/Unaligned_111028_h803_0070_BC087YACXX_2/Project_na/Sample_11783/11783_CGATGT_L002_R1_001.fastq.gz",
  "WorkflowInfo_id": "11805"
}{
  "_id": "12048",
  "file_path": "/oicr/data/archive/seqware/seqware_analysis/results/seqware-0.10.0_IlluminaBaseCalling-1.8.2/913119/Unaligned_111028_h803_0070_BC087YACXX_2/Project_na/Sample_11783/11783_CGATGT_L002_R2_001.fastq.gz",
  "WorkflowInfo_id": "11805"
}{
  "_id": "12055",
  "file_path": "/oicr/data/archive/seqware/seqware_analysis/results/seqware-0.10.0_IlluminaBaseCalling-1.8.2/913119/Unaligned_111028_h803_0070_BC087YACXX_2/Project_na/Sample_11779/11779_ACAGTG_L002_R1_001.fastq.gz",
  "WorkflowInfo_id": "11805"
}
...
```

#### IUSSWIDReportData
- _id: ius SWID (seqware accession for the particular library seq)
- library_name: name of library that was sequenced
- data: json details report data associated to the library seq

```
> db.IUSSWIDReportData.find()
{
  "_id": "592409",
  "library_name": "CPCG_0349_Pr_P_PE_680_WG",
  "data": {
    "Run Name": "130827_h239_0205_AC2CJJACXX",
    "Lane": 7,
    "Barcode": "NoIndex",
    "Reads/SP": "1.03",
    "Map %": "81.46%",
    "Reads": 371050656,
    "Yield": 37476030707,
    "% on Target": "100.00%",
    "Insert Mean": "390.96",
    "Insert Stdev": "115.61",
    "Read Length": "101,101",
    "Coverage (collapsed)": "9.19",
    "Coverage (raw)": "9.47",
    "% Mouse Content": "N/A"
  }
}
```

The data extracted from files in json directory for the details pages

function: updateIUSSWIDReportData

#### IUSSWIDRNASeqQCData
- _id: ius SWID (seqware accession for the particular library seq)
- library_name: name of library that was sequenced
- data: rna seq qc details report data associated to the library seq

```
> db.IUSSWIDRNASeqQCData.find()
{
  "_id": "1271394",
  "library_name": "HALT_1678_Lv_P_PE_600_MR",
  "data": {
    "Total Reads": "50720838",
    "Uniq Reads": "45517225",
    "Reads/SP": "2.61",
    "Yield": "3413791875",
    "Passed Filter Aligned Bases": "3413413185",
    "Coding Bases": "1266080233",
    "UTR Bases": "961632593",
    "Intronic Bases": "696536490",
    "Intergenic Bases": "489163869",
    "Correct Strand Reads": "0",
    "Incorrect Strand Reads": "0",
    "Proportion Coding Bases": "0.370913",
    "Proportion UTR Bases": "0.281722",
    "Proportion Intronic Bases": "0.204059",
    "Proportion Intergenic Bases": "0.143306",
    "Proportion mRNA Bases": "0.652635",
    "Proportion Usable Bases": "0.652563",
    "Proportion Correct Strand Reads": "0",
    "Median CV Coverage": "0.531802",
    "Median 5Prime Bias": "0.097145",
    "Median 3Prime Bias": "0.449012",
    "Median 5Prime to 3Prime Bias": "0.248396",
    "% rRNA Content": "0.62",
    "run_name": "141024_D00353_0082_AC57H2ANXX",
    "lane": "2"
  }
}
```

RNA Seq QC data associated with a particular IUSSWID (unique for library seq)

function: updateIUSSIWDRNASeqQCData

#### IUSSWIDGraphData
Note: Graphs are generated using Google charts and the data is in the format that is required for the function: drawGraphsById to plot graphs

- _id: ius SWID (seqware accession for the particular library seq)
- Read Breakdown: data required to plot read breakdown graph
- Insert Distribution: data required to plot insert distribution graph
- Soft Clip by Cycle: data required to plot soft clip by cycle graph
- Title: graph header title

```
> db.IUSSWIDGraphData.find()
{ "_id" : "8853", "Read Breakdown" : { "Colors" : [ "#878BB6", "#4ACAB4", "#FF8153", "#FFEA88" ], "Labels" : [ "Reads", "on target", "off target", "repeat/low quality", "unmapped" ], "Data" : [ "Number", 106723717, 47313717, 16706656, 16416403 ] }, "Insert Distribution" : { "x values" : [ { "label" : "Insert size", "id" : "Insert size", "type" : "number" }, "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "100", "101", "102", "103", "104", "105", "106", "107", "108", "109", "110", "111", "112", "113", "114", "115", "116", "117", "118", "119", "120", "121", "122", "123", "124", "125", "126", "127", "128", "129", "130", "131", "132", "133", "134", "135", "136", "137", "138", "139", "140", "141", "142", "143", "144", "145", "146", "147", "148", "149", "150", "151", "152", "153", "154", "155", "156", "157", "158", "159", "160", "161", "162", "163", "164", "165", "166", "167", "168", "169", "170", "171", "172", "173", "174", "175", "176", "177", "178", "179", "180", "181", "182", "183", "184", "185", "186", "187", "188", "189", "190", "191", "192", "193", "194", "195", "196", "197", "198", "199", "200", "201", "202", "203", "204", "205", "206", "207", "208", "209", "210", "211", "212", "213", "214", "215", "216", "217", "218", "219", "220", "221", "222", "223", "224", "225", "226", "227", "228", "229", "230", "231", "232", "233", "234", "235", "236", "237", "238", "239", "240", "241", "242", "243", "244", "245", "246", "247", "248", "249", "250", "251", "252", "253", "254", "255", "256", "257", "258", "259", "260", "261", "262", "263", "264", "265", "266", "267", "268", "269", "270", "271", "272", "273", "274", "275", "276", "277", "278", "279", "280", "281", "282", "283", "284", "285", "286", "287", "288", "289", "290", "291", "292", "293", "294", "295", "296", "297", "298", "299", "300", "301", "302", "303", "304", "305", "306", "307", "308", "309", "310", "311", "312", "313", "314", "315", "316", "317", "318", "319", "320", "321", "322", "323", "324", "325", "326", "327", "328", "329", "330", "331", "332", "333", "334", "335", "336", "337", "338", "339", "340", "341", "342", "343", "344", "345", "346", "347", "348", "349", "350", "351", "352", "353", "354", "355", "356", "357", "358", "359", "360", "361", "362", "363", "364", "365", "366", "367", "368", "369", "370", "371", "372", "373", "374", "375", "376", "377", "378", "379", "380", "381", "382", "383", "384", "385", "386", "387", "388", "389", "390", "391", "392", "393", "394", "395", "396", "397", "398", "399", "400", "401", "402", "403", "404", "405", "406", "407", "408", "409", "410", "411", "412", "413", "414", "415", "416", "417", "418", "419", "420", "421", "422", "423", "424", "425", "426", "427", "428", "429", "430", "431", "432", "433", "434", "435", "436", "437", "438", "439", "440", "441", "442", "443", "444", "445", "446", "447", "448", "449", "450", "451", "452", "453", "454", "455", "456", "457", "458", "459", "460", "461", "462", "463", "464", "465", "466", "467", "468", "469", "470", "471", "472", "473", "474", "475", "476", "477", "478", "479", "480", "481", "482", "483", "484", "485", "486", "487", "488", "489", "490", "491", "492", "493", "494", "495", "496", "497", "498", "499", "500", "501", "502", "503", "504", "505", "506", "507", "508", "509", "510", "511", "512", "513", "514", "515", "516", "517", "518", "519", "520", "521", "522", "523", "524", "525", "526", "527", "528", "529", "530", "531", "532", "533", "534", "535", "536", "537", "538", "539", "540", "541", "542", "543", "544", "545", "546", "547", "548", "549", "550", "551", "552", "553", "554", "555", "556", "557", "558", "559", "560", "561", "562", "563", "564", "565", "566", "567", "568", "569", "570", "571", "572", "573", "574", "575", "576", "577", "578", "579", "580", "581", "582", "583", "584", "585", "586", "587", "588", "589", "590", "591", "592", "593", "594", "595", "596", "597", "598", "599", "600", "601", "602", "603", "604", "605", "606", "607", "608", "609", "610", "611", "612", "613", "614", "615", "616", "617", "618", "619", "620", "621", "622", "623", "624", "625", "626", "627", "628", "629", "630", "631", "632", "633", "634", "635", "636", "637", "638", "639", "640", "641", "642", "643", "644", "645", "646", "647", "648", "649" ], "y values" : [ { "label" : "Pairs", "id" : "Pairs", "type" : "number" }, 1000, 0, 0, 1000, 1000, 1000, 0, 1000, 1000, 1000, 1000, 4000, 4000, 3000, 2000, 7000, 8000, 3000, 7000, 15000, 12000, 12000, 26000, 21000, 20000, 34000, 44000, 65000, 77000, 79000, 115000, 122000, 130000, 174000, 179000, 239000, 259000, 332000, 345000, 394000, 425000, 481000, 534000, 548000, 611000, 611000, 690000, 736000, 790000, 829000, 807000, 853000, 888000, 882000, 916000, 959000, 984000, 944000, 975000, 978000, 929000, 886000, 810000, 809000, 769000, 778000, 803000, 721000, 760000, 681000, 634000, 675000, 538000, 557000, 528000, 493000, 489000, 487000, 516000, 493000, 436000, 412000, 448000, 438000, 491000, 439000, 421000, 451000, 449000, 463000, 436000, 483000, 421000, 498000, 457000, 463000, 511000, 437000, 479000, 507000, 516000, 470000, 493000, 491000, 447000, 434000, 412000, 458000, 437000, 409000, 448000, 405000, 390000, 386000, 365000, 370000, 368000, 291000, 300000, 281000, 264000, 263000, 263000, 248000, 234000, 166000, 179000, 161000, 164000, 143000, 127000, 127000, 118000, 93000, 103000, 96000, 96000, 86000, 74000, 67000, 48000, 47000, 56000, 48000, 55000, 53000, 43000, 41000, 48000, 38000, 34000, 25000, 21000, 32000, 25000, 36000, 22000, 31000, 21000, 13000, 15000, 20000, 13000, 14000, 9000, 20000, 10000, 7000, 9000, 8000, 8000, 11000, 12000, 4000, 4000, 2000, 6000, 8000, 7000, 3000, 6000, 3000, 5000, 4000, 8000, 6000, 5000, 9000, 5000, 3000, 3000, 1000, 3000, 5000, 4000, 3000, 5000, 3000, 3000, 3000, 3000, 6000, 4000, 3000, 1000, 3000, 3000, 3000, 1000, 3000, 1000, 2000, 2000, 2000, 1000, 3000, 3000, 2000, 2000, 2000, 2000, 5000, 3000, 2000, 3000, 1000, 2000, 1000, 0, 1000, 1000, 1000, 4000, 1000, 2000, 2000, 2000, 0, 2000, 2000, 1000, 3000, 1000, 0, 2000, 0, 1000, 1000, 2000, 1000, 0, 3000, 1000, 0, 0, 1000, 1000, 0, 0, 0, 3000, 0, 0, 0, 1000, 0, 1000, 1000, 0, 1000, 0, 2000, 0, 0, 0, 1000, 1000, 0, 0, 0, 0, 0, 1000, 0, 2000, 0, 0, 0, 0, 0, 0, 1000, 0, 2000, 0, 1000, 0, 0, 0, 0, 0, 0, 0, 0, 2000, 0, 0, 1000, 0, 0, 0, 0, 0, 0, 0, 0, 1000, 1000, 0, 0, 0, 0, 0, 0, 1000, 0, 0, 0, 1000, 1000, 1000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1000, 0, 1000, 0, 0, 0, 1000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1000, 0, 0, 0, 0, 0, 1000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], "Colors" : [ { "type" : "string", "role" : "style" }, "#A6FF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#A6FF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FFFF4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D", "#FF4D4D" ] }, "Soft Clip by Cycle" : { "x values" : [ { "label" : "Cycle", "id" : "Cycle", "type" : "number" }, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 101, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203 ], "y values" : [ { "label" : "% Bases Soft Clipped", "id" : "% Bases Soft Clipped", "type" : "number" }, 0.30445096098171426, 0.2073255010366275, 0.09338986533181419, 0.08591867610526906, 0.07657968957208763, 0.06537290573226993, 0.06163731111899737, 0.054166121892452235, 0.046694932665907095, 0.04295933805263453, 0.039223743439361955, 0.03735594613272568, 0.03735594613272568, 0.035488148826089395, 0.026149162292907972, 0.026149162292907972, 0.02428136498627169, 0.02428136498627169, 0.020545770372999123, 0.01867797306636284, 0.016810175759726556, 0.020545770372999123, 0.029884756906180542, 0.03735594613272568, 0.054166121892452235, 0.11953902762472217, 0.12327462223799474, 0.14008479799772128, 0.1606305683707204, 0.21292889295653636, 0.27830179868880633, 0.3007153663684417, 0.3249967313547134, 0.36048488018080277, 0.41653435941498407, 0.5510207893606291, 0.5715780035863718, 0.6201550387596899, 0.661286707016364, 0.771529983186998, 0.9920227175070526, 1.0219905461203593, 1.0706678126985314, 1.1660282163879285, 1.3062978882451879, 1.721398800067286, 1.792590377210363, 1.899278423748458, 2.0250939621159705, 2.3282778224524527, 2.927312857730725, 2.9790419161676644, 3.097568736079657, 3.2974440595449863, 3.713627250754155, 4.582442719466007, 4.704248089955135, 4.884560427164022, 5.170595767116065, 5.768940537277392, 6.878226828299638, 6.977361495582269, 7.16595647542231, 7.499856872960439, 8.156850719665753, 9.370844975431158, 9.491328359655073, 9.70669164568819, 10.004914971001671, 10.757185332011893, 12.175061535690702, 12.296988451348016, 12.46803199869059, 12.82051282051282, 13.384469895975624, 14.579291820332985, 14.70352477306701, 14.886531548419823, 15.141445891333632, 15.97271499530753, 17.421220814965128, 17.66301761066159, 17.987552875966355, 18.663250584548035, 19.949572127139366, 22.441890833115696, 22.741866438356166, 23.21737459158178, 24.035692099169818, 25.91358275132582, 29.82221429420859, 30.132723112128147, 30.679933665008292, 31.70966191315494, 34.026179043609815, 38.70869755982314, 39.18255942509674, 39.66458658346334, 40.650909090909096, 42.42051511424205, 45.9206658267476, 0, 0.601684717208183, 0.36853188929001207, 0.22751203369434417, 0.21623044524669072, 0.1861462093862816, 0.16734356197352587, 0.1523014440433213, 0.13161853188929, 0.11281588447653429, 0.09213297232250302, 0.08085138387484958, 0.07521058965102287, 0.06204873646209386, 0.054527677496991576, 0.048886883273164865, 0.043246089049338146, 0.03572503008423586, 0.030084235860409148, 0.028203971119133572, 0.026323706377858, 0.02256317689530686, 0.026323706377858, 0.033844765342960284, 0.04512635379061372, 0.052647412755716, 0.09213297232250302, 0.10153429602888085, 0.105294825511432, 0.12409747292418773, 0.14854091456077015, 0.18426594464500604, 0.1917870036101083, 0.197427797833935, 0.21623044524669072, 0.26323706377858, 0.34596871239470517, 0.35537003610108303, 0.3685596088755171, 0.3930122792831757, 0.44570654831308537, 0.5435293675123657, 0.5566944386977863, 0.5905696928661438, 0.6357326913310889, 0.7147962830593281, 0.8804274211754082, 0.9011720881229658, 0.9351773449995295, 0.9919066440805572, 1.088102409638554, 1.3105123425408123, 1.3487802580766695, 1.4002487655949645, 1.4820401621570662, 1.5998490708423734, 1.895841987990483, 1.9562998525687068, 2.0495836487509465, 2.2215903705809876, 2.4943956837265855, 2.9878315845600136, 3.09034339269694, 3.215674257368854, 3.4716749005209433, 3.923840420190785, 4.761257763975156, 4.9264547887406485, 5.110910092031778, 5.375406326805677, 5.981076593786882, 7.0972693488447245, 7.280522662311148, 7.536578822461151, 8.007522724898129, 8.82097733381304, 10.19452913642805, 10.439944134078212, 10.748752079866888, 11.367332188996295, 12.460872767446142, 14.246485319313729, 14.600709423832805, 15.054684250446526, 15.770779659321143, 17.013213151695176, 19.327510687963912, 19.623453469607316, 20.15523146613634, 21.037709101219164, 22.919520797504884, 26.324755671119878, 26.717510490367243, 27.38016658808738, 28.59491875161207, 30.625867424492764, 34.54884667571235, 34.9446263146897, 35.70534149046546, 37.02360011726766, 39.64676766161692, 45.10639932396097 ] }, "Title" : "110217_SN203_0104_B81CDEABXX Lane: 1 Barcode: NoIndex Library: PCSI_0010_Pa_P_PE_246_EX"}
```
For a specific library seq, contains data to graph using Google Charts

function: updateGraphData

#### Report Run Data
- _id: run name
- reads: total reads for a run
- yield: total yields for a run
- % target: total % on target for a run
- lane_#: the raw yield, raw reads, number of libraries associated with a particular lane on a run

```
> db.ReportRunData.find()
{
  "_id": "151002_D00331_0142_AC7G20ANXX",
  "reads": 1871967478,
  "yield": 235867066564,
  "% target": 1130,
  "lane_5": {
    "raw_yield": 49455621700,
    "raw_reads": 392507150,
    "num_libraries": 6
  },
  "lane_8": {
    "raw_yield": 40842808077,
    "raw_reads": 324149918,
    "num_libraries": 1
  },
  "lane_6": {
    "raw_yield": 39419203643,
    "raw_reads": 312851172,
    "num_libraries": 1
  },
  "lane_7": {
    "raw_yield": 48401662621,
    "raw_reads": 384140558,
    "num_libraries": 1
  },
  "lane_1": {
    "raw_yield": 57747770523,
    "raw_reads": 458318680,
    "num_libraries": 6
  }
}
```
Queries through existing database data and reports on lane totals for a specific run and lane

function: updateLaneDetailsTotalsByRun

#### Run Report Data Phasing
- _id: run name
- lane_#: run lane details 

```
> db.RunReportDataPhasing.find()
{
  "_id": "141016_D00353_0081_BC5M0LANXX",
  "lane_8": {
    "Phasing (R1/R2)": "0.19/0.23",
    "PF% Sequencing": "89.67",
    "Source": "BIN",
    "Prephasing {R1/R2)": "0.16/0.20"
  },
  "lane_1": {
    "Phasing (R1/R2)": "0.18/0.23",
    "PF% Sequencing": "89.61",
    "Source": "BIN",
    "Prephasing {R1/R2)": "0.16/0.21"
  },
  "lane_7": {
    "Phasing (R1/R2)": "0.18/0.24",
    "PF% Sequencing": "90.19",
    "Source": "BIN",
    "Prephasing {R1/R2)": "0.16/0.21"
  },
  "lane_4": {
    "Phasing (R1/R2)": "0.19/0.24",
    "PF% Sequencing": "88.79",
    "Source": "BIN",
    "Prephasing {R1/R2)": "0.18/0.21"
  },
  "lane_2": {
    "Phasing (R1/R2)": "0.18/0.22",
    "PF% Sequencing": "89.98",
    "Source": "BIN",
    "Prephasing {R1/R2)": "0.16/0.21"
  },
  "lane_5": {
    "Phasing (R1/R2)": "0.18/0.23",
    "PF% Sequencing": "91.96",
    "Source": "BIN",
    "Prephasing {R1/R2)": "0.16/0.21"
  },
  "lane_6": {
    "Phasing (R1/R2)": "0.18/0.23",
    "PF% Sequencing": "90.55",
    "Source": "BIN",
    "Prephasing {R1/R2)": "0.16/0.21"
  },
  "lane_3": {
    "Phasing (R1/R2)": "0.18/0.22",
    "PF% Sequencing": "89.40",
    "Source": "BIN",
    "Prephasing {R1/R2)": "0.16/0.21"
  }
}
```

Reports on Prephasing, phasing and PF% of a particular lane on a run

Uses the function get_XML_Data from wideInstrumentReport.pm perl module for each run

Note: perl module outputs returned object into json file that is taken in by a separate javascript file to upload to mongo (can't directly upload to mongo because unable to use MongoDB.pm on the cluster due to outdated C compilier libc6.so)