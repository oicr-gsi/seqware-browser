seqware-browser
================
API code for next gen seqware browser

Re-redocumentation

Collections are organized by respective _id's which unique to each document in the collection, but depending on the collection represent different things

Data is collected from three main data sources: seqware postgres database, pinery webservice, file provenance report

### Collections

#### Current Sequencer Runs
> db.CurrentSequencerRuns.find()
```
{
  "_id": "160211_M00146_0039_000000000-AJLRE",
  "created_date": "2016-02-11 16:03:13",
  "status": "Running"
}{
  "_id": "160219_D00331_0178_BC8BTHANXX",
  "created_date": "2016-02-19 15:42:13",
  "status": "Running"
}{
  "_id": "160315_D00355_0113_BC8KRBANXX",
  "created_date": "2016-03-15 14:02:11",
  "status": "Running"
}{
  "_id": "160317_D00331_0180_AC8W0EANXX",
  "created_date": "2016-03-17 14:58:58",
  "status": "Running"
}{
  "_id": "160322_D00343_0115_BC8KKNANXX",
  "created_date": "2016-03-23 13:39:10",
  "status": "Running"
}
```
Displays all currently running sequencer runs before the date 2014-02-01.

Runs a query in seqware database for all completed sequencer runs after 2014-02-01 and the list is compared to the running sequencer runs from pinery. If the sequencer is 'running' in pinery but appears in seqware database, the sequencer run is complete so the entry is removed from the CurrentSequencerRuns collection.

Failed sequencer runs don't appear in seqware database so if the status is failed on pinery, the status is updated in the RunInfo collection.

#### Current Workflow Runs
> db.CurrentWorkflowRuns.find()
```
{
  "_id": 3452850,
  "sw_accession": 3452850,
  "workflow_run_id": 201917,
  "status": "running",
  "status_cmd": "0000757-160202125311466-oozie-oozi-W",
  "create_tstmp": "2016-03-22 10:46:37",
  "last_modified": "2016-03-22 15:04:21",
  "name": "CASAVA",
  "version": "2.8",
  "template_ids": [
    "12850"
  ],
  "sequencer_run_names": [
    "110916_SN804_0064_AD04TBACXX"
  ],
  "library_id": [
    "110916_SN804_0064_AD04TBACXX||4||12850"
  ],
  "analysis_type": "Base calling"
}{
  "_id": 3447735,
  "sw_accession": 3447735,
  "workflow_run_id": 201886,
  "status": "running",
  "status_cmd": "0000721-160202125311466-oozie-oozi-W",
  "create_tstmp": "2016-03-21 10:45:40",
  "last_modified": "2016-03-21 14:46:04",
  "name": "CASAVA",
  "version": "2.8",
  "template_ids": [
    "12850"
  ],
  "sequencer_run_names": [
    "110916_SN804_0064_AD04TBACXX"
  ],
  "library_id": [
    "110916_SN804_0064_AD04TBACXX||4||12850"
  ],
  "analysis_type": "Base calling"
}{
  "_id": 3439496,
  "sw_accession": 3439496,
  "workflow_run_id": 201816,
  "status": "running",
  "status_cmd": "0000628-160202125311466-oozie-oozi-W",
  "create_tstmp": "2016-03-15 15:43:45",
  "last_modified": "2016-03-15 19:44:02",
  "name": "CASAVA",
  "version": "2.8",
  "template_ids": [
    "12850"
  ],
  "sequencer_run_names": [
    "110916_SN804_0064_AD04TBACXX"
  ],
  "library_id": [
    "110916_SN804_0064_AD04TBACXX||4||12850"
  ],
  "analysis_type": "Base calling"
}{
  "_id": 3447739,
  "sw_accession": 3447739,
  "workflow_run_id": 201890,
  "status": "running",
  "status_cmd": "0000720-160202125311466-oozie-oozi-W",
  "create_tstmp": "2016-03-21 10:45:40",
  "last_modified": "2016-03-21 14:46:04",
  "name": "CASAVA",
  "version": "2.8",
  "template_ids": [
    "12850"
  ],
  "sequencer_run_names": [
    "110916_SN804_0064_AD04TBACXX"
  ],
  "library_id": [
    "110916_SN804_0064_AD04TBACXX||4||12850"
  ],
  "analysis_type": "Base calling"
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
  "template_ids": [
    "12850"
  ],
  "sequencer_run_names": [
    "110916_SN804_0064_AD04TBACXX"
  ],
  "library_id": [
    "110916_SN804_0064_AD04TBACXX||4||12850"
  ],
  "analysis_type": "Base calling"
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
  "template_ids": [
    "12850"
  ],
  "sequencer_run_names": [
    "110916_SN804_0064_AD04TBACXX"
  ],
  "library_id": [
    "110916_SN804_0064_AD04TBACXX||4||12850"
  ],
  "analysis_type": "Base calling"
}
...
```
Displays all currently running workflow runs

Runs a query in seqware database for all workflow runs with status = 'running' and adds to CurrentWorkflowRuns collection. The ids for all documents already in the CurrentWorkflowRuns collection are also queried for and if the status changes, the document is removed from the collection and updated in WorkflowInfo collection and other associated collections that require Workflow data. If the status = 'failed', the document is added to a FailedWorkflowRuns collection.

#### Failed Workflow Runs
> db.FailedWorkflowRuns.find()
```

```
Displays all workflow runs that have gone from running > failed.

#### Date Info
> db.DateInfo.find()
```
{
  "_id": "2014-01-05",
  "LibraryInfo_id": [
    "120920_SN7001205_0091_AC0LYGACXX||4||23256",
    "121003_SN1080_0122_AC14D3ACXX||6||22409",
    "110927_SN804_0069_BC0472ACXX||2||13285",
    "130614_SN804_0120_BD29DBACXX||6||35173",
    "130717_SN801_0116_AC27N4ACXX||5||38707",
    "091214_i278_616JH_LT||3||1885"
  ],
  "RunInfo_id": [
    "120920_SN7001205_0091_AC0LYGACXX",
    "121003_SN1080_0122_AC14D3ACXX",
    "110927_SN804_0069_BC0472ACXX",
    "130614_SN804_0120_BD29DBACXX",
    "130717_SN801_0116_AC27N4ACXX",
    "091214_i278_616JH_LT"
  ]
}
```
Displays all date documents and all associated libraries and runs data that have occurred within that date
The _id is the date
The RunInfo_id and LibraryInfo_id references the RunInfo collection and the LibraryInfo collection

functions: updateWorkflowInfo

#### Donor Info
> db.DonorInfo.find({_id: "PSCI_0015"})
```
{
  "_id": "PCSI_0015",
  "LibraryInfo_id": [
    "140722_D00353_0062_BC40U9ANXX||3||64471",
    "140722_D00353_0062_BC40U9ANXX||2||64476",
    "140731_D00353_0063_AC40UNANXX||3||64514",
    "140731_D00353_0063_AC40UNANXX||4||64516",
    "140806_D00331_0066_BC5EHHANXX||3||64514",
    "140806_D00331_0066_BC5EHHANXX||4||64516",
    "141224_D00353_0087_AC5ULHANXX||7||64476"
  ],
  "libraries": [
    "PCSI_0015_Pa_R_PE_608_WG",
    "PCSI_0015_Pa_R_PE_611_WG",
    "PCSI_0015_Pa_P_PE_590_WG",
    "PCSI_0015_Pa_P_PE_579_WG",
    "PCSI_0015_Pa_P_PE_590_WG",
    "PCSI_0015_Pa_P_PE_579_WG",
    "PCSI_0015_Pa_R_PE_611_WG"
  ],
  "institute": "University Health Network",
  "status": "Completed",
  "library_total": 7,
  "library_types": {
    "WG": 7
  },
  "tissue_types": {
    "R": 3,
    "P": 4
  }
}
```
Displays all information associated with a particular donor
The _id is associated with the name of the donor.

The LibraryInfo_id array references the LibraryInfo collection: see below

functions: updateDonorInfo

#### Library Info
> db.LibraryInfo.find()
```
{
  "_id": "120905_h803_0094_BD184RACXX||8||23413",
  "template_id": 23413,
  "library_name": "DCR_0008_nn_X_PE_424_EX",
  "ProjectInfo_id": "DCR",
  "RunInfo_id": "120905_h803_0094_BD184RACXX",
  "lane": 8,
  "status": "Completed",
  "create_date": "2012-08-31 14:51:51",
  "prep_date": "2012-08-29 10:28:53",
  "library_type": "EX",
  "tissue_type": "X",
  "DonorInfo_id": "DCR_0008",
  "institute": "n/a",
  "tissue_origin": "nn",
  "barcode": "ATCACG",
  "WorkflowInfo_id": [
    278585,
    278214
  ],
  "iusswid": "276714",
  "analysis_total": {
    "Alignment": {
      "completed": 1
    },
    "Base calling": {
      "completed": 1
    }
  }
}
```
Displays all information associated with a particular library
To acquire uniqueness, the _id is a collection of the sequencer run name, lane, and template id (each separated by an underscore) (e.g., run.id_lane_template.id)

##### Example queries:
Get all Libraries for a run:
> db.LibraryInfo.find({"RunInfo_id":"110114_H239_0105_A81CK4ABXX"})
```
{
  "_id": "110114_H239_0105_A81CK4ABXX||5||6217",
  "template_id": 6217,
  "library_name": "FCSG_0002_Li_P_PE_300_EX",
  "ProjectInfo_id": "FCSG",
  "RunInfo_id": "110114_H239_0105_A81CK4ABXX",
  "lane": 5,
  "status": "Completed",
  "create_date": "2010-12-17 16:10:11",
  "prep_date": "2010-12-17 15:02:16",
  "library_type": "EX",
  "tissue_type": "P",
  "DonorInfo_id": "FCSG_0002",
  "barcode": "noIndex",
  "WorkflowInfo_id": [
    25831
  ],
  "iusswid": "8172",
  "analysis_total": {
    "Base calling": {
      "completed": 1
    }
  }
}{
  "_id": "110114_H239_0105_A81CK4ABXX||8||6515",
  "template_id": 6515,
  "library_name": "PCSI_0008_Pa_P_PE_261_EX",
  "ProjectInfo_id": "PCSI",
  "RunInfo_id": "110114_H239_0105_A81CK4ABXX",
  "lane": 8,
  "status": "Completed",
  "create_date": "2010-12-17 15:28:27",
  "prep_date": "2010-11-08 16:46:21",
  "library_type": "EX",
  "tissue_type": "P",
  "DonorInfo_id": "PCSI_0008",
  "institute": "n/a",
  "tissue_origin": "Pancreas",
  "barcode": "noIndex",
  "WorkflowInfo_id": [
    1630215,
    414786,
    1793543,
    1691080,
    25831,
    415419,
    556375,
    2892503,
    243269,
    33247,
    922112
  ],
  "iusswid": "8995",
  "analysis_total": {
    "Quality Control": {
      "completed": 5
    },
    "Base calling": {
      "completed": 3
    },
    "Alignment": {
      "completed": 1
    },
    "Variant Calling": {
      "completed": 1
    }
  }
}
...
```

Get all libraries for a project:
> db.LibraryInfo.find({"ProjectInfo_id": "TLCR"})
```
{
  "_id": "110111_SN203_0095_A816VMABXX||1||6285",
  "template_id": 6285,
  "library_name": "TLCR_1R4_nn_n_PE_500_WG",
  "ProjectInfo_id": "TLCR",
  "RunInfo_id": "110111_SN203_0095_A816VMABXX",
  "lane": 1,
  "status": "Completed",
  "create_date": "2010-12-20 15:36:11",
  "prep_date": "2010-12-20 15:36:11",
  "library_type": "WG",
  "tissue_type": "n",
  "DonorInfo_id": "TLCR_1R4",
  "barcode": "noIndex",
  "WorkflowInfo_id": [
    25831
  ],
  "iusswid": "10783",
  "analysis_total": {
    "Base calling": {
      "completed": 1
    }
  }
}{
  "_id": "110111_SN203_0095_A816VMABXX||1||6288",
  "template_id": 6288,
  "library_name": "TLCR_1C11_nn_n_PE_500_WG",
  "ProjectInfo_id": "TLCR",
  "RunInfo_id": "110111_SN203_0095_A816VMABXX",
  "lane": 1,
  "status": "Completed",
  "create_date": "2010-12-20 15:36:11",
  "prep_date": "2010-12-20 15:36:11",
  "library_type": "WG",
  "tissue_type": "n",
  "DonorInfo_id": "TLCR_1C11",
  "barcode": "noIndex",
  "WorkflowInfo_id": [
    25831
  ],
  "iusswid": "10778",
  "analysis_total": {
    "Base calling": {
      "completed": 1
    }
  }
}{
  "_id": "10212011-2||1||14199",
  "template_id": 14199,
  "library_name": "TLCR_PCR1",
  "ProjectInfo_id": "TLCR",
  "RunInfo_id": "10212011-2",
  "lane": 1,
  "status": "Completed",
  "create_date": "2011-10-21 16:12:20",
  "prep_date": "2011-10-21 16:12:20",
  "barcode": "noIndex"
}{
  "_id": "110111_SN203_0095_A816VMABXX||1||6287",
  "template_id": 6287,
  "library_name": "TLCR_1C10_nn_n_PE_500_WG",
  "ProjectInfo_id": "TLCR",
  "RunInfo_id": "110111_SN203_0095_A816VMABXX",
  "lane": 1,
  "status": "Completed",
  "create_date": "2010-12-20 15:36:11",
  "prep_date": "2010-12-20 15:36:11",
  "library_type": "WG",
  "tissue_type": "n",
  "DonorInfo_id": "TLCR_1C10",
  "barcode": "noIndex"
}{
  "_id": "110111_SN203_0095_A816VMABXX||1||6283",
  "template_id": 6283,
  "library_name": "TLCR_1R2_nn_n_PE_500_WG",
  "ProjectInfo_id": "TLCR",
  "RunInfo_id": "110111_SN203_0095_A816VMABXX",
  "lane": 1,
  "status": "Completed",
  "create_date": "2010-12-20 15:36:11",
  "prep_date": "2010-12-20 15:36:11",
  "library_type": "WG",
  "tissue_type": "n",
  "DonorInfo_id": "TLCR_1R2",
  "barcode": "noIndex",
  "WorkflowInfo_id": [
    25831
  ],
  "iusswid": "10781",
  "analysis_total": {
    "Base calling": {
      "completed": 1
    }
  }
}
...
```

Get all libraries for a donor:
> db.LibraryInfo.find({"DonorInfo_id": "PCSI_0001"})
```
{
  "_id": "110406_SN801_0046_BB0809ABXX||1||7926",
  "template_id": 7926,
  "library_name": "PCSI_0001_Pa_X_PE_193_EX",
  "ProjectInfo_id": "PCSI",
  "RunInfo_id": "110406_SN801_0046_BB0809ABXX",
  "lane": 1,
  "status": "Completed",
  "create_date": "2011-03-01 14:01:34",
  "prep_date": "2010-08-30 15:51:51",
  "library_type": "EX",
  "tissue_type": "X",
  "DonorInfo_id": "PCSI_0001",
  "institute": "n/a",
  "tissue_origin": "Ly",
  "barcode": "noIndex",
  "WorkflowInfo_id": [
    134082,
    2892438,
    636716,
    558303,
    416290,
    636708,
    635879,
    1690847,
    25831,
    1629680,
    1793532,
    453505,
    33247,
    431729,
    638355
  ],
  "iusswid": "9107",
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
      "completed": 2
    }
  }
}{
  "_id": "110520_SN801_0050_AB09E1ABXX||1||7055",
  "template_id": 7055,
  "library_name": "PCSI_0001_Pa_P_PE_230_EX",
  "ProjectInfo_id": "PCSI",
  "RunInfo_id": "110520_SN801_0050_AB09E1ABXX",
  "lane": 1,
  "status": "Completed",
  "create_date": "2011-03-01 16:02:06",
  "prep_date": "2009-04-21 17:56:24",
  "library_type": "EX",
  "tissue_type": "P",
  "DonorInfo_id": "PCSI_0001",
  "institute": "n/a",
  "tissue_origin": "Ly",
  "barcode": "noIndex",
  "WorkflowInfo_id": [
    560678,
    1690275,
    1791005,
    1628693,
    25831,
    2891749,
    479025
  ],
  "iusswid": "9349",
  "analysis_total": {
    "Quality Control": {
      "completed": 5
    },
    "Base calling": {
      "completed": 1
    },
    "Alignment": {
      "completed": 1
    }
  }
}{
  "_id": "100831_h239_0092_A20269ABXX||4||4103",
  "template_id": 4103,
  "library_name": "PCSI_0001_Pa_X_PE_400_WG",
  "ProjectInfo_id": "PCSI",
  "RunInfo_id": "100831_h239_0092_A20269ABXX",
  "lane": 4,
  "status": "Completed",
  "create_date": "2010-09-01 12:07:07",
  "prep_date": "2010-08-30 15:51:51",
  "library_type": "WG",
  "tissue_type": "X",
  "DonorInfo_id": "PCSI_0001",
  "institute": "n/a",
  "tissue_origin": "Ly",
  "barcode": "noIndex",
  "WorkflowInfo_id": [
    72763
  ],
  "iusswid": "14333",
  "analysis_total": {
    "Variant Calling": {
      "completed": 1
    }
  }
}{
  "_id": "100831_h239_0092_A20269ABXX||3||4103",
  "template_id": 4103,
  "library_name": "PCSI_0001_Pa_X_PE_400_WG",
  "ProjectInfo_id": "PCSI",
  "RunInfo_id": "100831_h239_0092_A20269ABXX",
  "lane": 3,
  "status": "Completed",
  "create_date": "2010-09-01 12:07:07",
  "prep_date": "2010-08-30 15:51:51",
  "library_type": "WG",
  "tissue_type": "X",
  "DonorInfo_id": "PCSI_0001",
  "institute": "n/a",
  "tissue_origin": "Ly",
  "barcode": "noIndex",
  "WorkflowInfo_id": [
    62458
  ],
  "iusswid": "14331",
  "analysis_total": {
    "Variant Calling": {
      "completed": 1
    }
  }
}
...
```

functions: updateLibraryInfo, updateWorkflowInfo

#### Project Info
> db.ProjectInfo.find()
```
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
The _id is the name of the project

functions: updateProjectInfo

#### RunInfo
> db.RunInfo.find()
```
{
  "_id": "141126_D00353_0085_AC5UR6ANXX",
  "start_date": "2014-11-26 15:54:24",
  "status": "Completed",
  "LibraryInfo_id": [
    "141126_D00353_0085_AC5UR6ANXX||6||67298",
    "141126_D00353_0085_AC5UR6ANXX||2||67571",
    "141126_D00353_0085_AC5UR6ANXX||7||67299",
    "141126_D00353_0085_AC5UR6ANXX||1||69014",
    "141126_D00353_0085_AC5UR6ANXX||1||69010",
    "141126_D00353_0085_AC5UR6ANXX||1||69012",
    "141126_D00353_0085_AC5UR6ANXX||8||67541",
    "141126_D00353_0085_AC5UR6ANXX||4||67294",
    "141126_D00353_0085_AC5UR6ANXX||3||67295",
    "141126_D00353_0085_AC5UR6ANXX||5||67396"
  ],
  "library_types": {
    "WG": 7,
    "EX": 3
  },
  "tissue_types": {
    "P": 6,
    "R": 4
  },
  "library_totals": {
    "PCSI": 7,
    "JLES": 3
  },
  "donors": {
    "PCSI_0529": 2,
    "PCSI_0472": 2,
    "JLES_0004": 1,
    "JLES_0003": 1,
    "JLES_0002": 1,
    "PCSI_0340": 2,
    "PCSI_0571": 1
  },
  "donor_totals": {
    "PCSI": 4,
    "JLES": 3
  },
  "libraries": [
    "PCSI_0529_Pa_P_PE_579_WG",
    "PCSI_0472_Pa_P_PE_690_WG",
    "PCSI_0529_Pa_P_PE_690_WG",
    "JLES_0004_Br_R_PE_376_EX",
    "JLES_0003_Br_R_PE_456_EX",
    "JLES_0002_Br_R_PE_368_EX",
    "PCSI_0472_Si_R_PE_650_WG",
    "PCSI_0340_Pa_P_PE_608_WG",
    "PCSI_0340_Pa_P_PE_591_WG",
    "PCSI_0571_Pa_P_PE_595_WG"
  ],
  "projects": {
    "PCSI": 7,
    "JLES": 3
  },
  "num_libraries": 10,
  "analysis_total": {
    "Alignment": {
      "completed": 5,
      "failed": 1
    },
    "Quality Control": {
      "completed": 58
    },
    "Base calling": {
      "completed": 1
    }
  }
}
```

Lists information for a specified run
*Only captures those libraries with sample_type ending in library Seq
The _id is the sequencer run id provided by pinery

functions: updateRunInfo, updateWorkflowInfo

#### WorkflowInfo
> db.WorkflowInfo.find()
```
{
  "_id": 447295,
  "sw_accession": 447295,
  "workflow_run_id": 13723,
  "status": "failed",
  "status_cmd": null,
  "create_tstmp": "2012-12-28 06:09:16",
  "last_modified": "2012-12-28 06:09:16",
  "name": "BamQC",
  "version": "1.0",
  "template_ids": [
    "13301"
  ],
  "sequencer_run_names": [
    "110929_SN203_0126_BD082FACXX"
  ],
  "library_id": [
    "110929_SN203_0126_BD082FACXX||8||13301"
  ],
  "analysis_type": "Quality Control"
}
```

Provides information on workflow

functions: updateWorkflowInfo

#### FileInfo
> db.FileInfo.find()
```
{
  "_id": "12017",
  "file_path": "/oicr/data/archive/seqware/seqware_analysis/results/seqware-0.10.0_IlluminaBaseCalling-1.8.2/70453881/Unaligned_111028_SN393_0192_BC0AAKACXX_2/Project_na/Sample_11720/11720_TAGCTT_L002_R1_001.fastq.gz",
  "WorkflowInfo_id": "11804"
}

```
Files linked to associated workflow

functions: updateFilesInfo

To query for all files associated with WorkflowInfo_id:
> db.FileInfo.find({"WorkflowInfo_id": "11805"})
```
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
}{
  "_id": "12056",
  "file_path": "/oicr/data/archive/seqware/seqware_analysis/results/seqware-0.10.0_IlluminaBaseCalling-1.8.2/913119/Unaligned_111028_h803_0070_BC087YACXX_2/Project_na/Sample_11779/11779_ACAGTG_L002_R2_001.fastq.gz",
  "WorkflowInfo_id": "11805"
}
...
```


Updating mongodb:

// TODO: FIX THIS
Ensure that update-workflow-info.sh is run AFTER update-pinery-data.sh