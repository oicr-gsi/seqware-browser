seqware-browser
================
API code for next gen seqware browser

## Mongodb 
Currently on local machine, example data in collection:

```
> show collections
AnalysisStatusByLibrary
AnalysisStatusByProject
CurrentStats
CurrentStatsByProject
DonorInfo
DonorsByProject
InstrumentNamesByDonor
LastModifiedProjects
LibrariesByProject
LibrariesByRun
LibraryInfo
NumDonorsByProject
NumLibrariesByProject
NumLibrariesPerTissueByDonor
NumOfLibraryTypeByDonor
RNASeqQCDataByLibraryByRun
ReportDataByLibraryByLaneByDonor
ReportDataByLibraryByLaneByRun
RunDataByProject
StartDateByProject
StartEndDateByDonor
WorkflowByLibrary
```

### Collections:
All _ids for datasets within each collection is the [SWID of the base field] or a [string of the collective fields that make it unique]
*   AnalysisStatusByLibrary
    ```
    {
      "94": {
        "Workflow Runs": [
          "FileImport"
        ],
        "Analysis Status": {
          "Alignment": {
            
          },
          "Base calling": {
            "completed": 1
          },
          "Quality Control": {
            
          },
          "Variant Calling": {
            
          }
        },
        "Library Name": "PCSI_0024_Pa_P_MP_405_WG",
        "Last Modified": "2012-01-06 17:41:34"
      },
      "_id": "94"
    }
    ```

    Organized by library SWID, each contain the name of the library, an array of workflow runs under that library, last modified date, and number of workflows in each category, organized according to workflow run status

*   AnalysisStatusByProject
    ```
    {
      "4": {
        "Workflow Runs": [
          "FileImport",
          ""
        ],
        "Analysis Status": {
          "Alignment": {
            
          },
          "Base calling": {
            "completed": 2
          },
          "Quality Control": {
            
          },
          "Variant Calling": {
            
          }
        },
        "Project Name": "ICGCPancreaticCancerSeq",
        "Last Modified": "2012-01-18 16:40:08"
      },
      "_id": "4"
    }
    ```

    Organized by project SWID, each contain the name of the project, an array of workflow runs under that project, last modified date, and number of workflows in each category, organized according to workflow run status

*   CurrentStats
    ```
    {
      "Date From": "Unspecified",
      "Date To": "2016-02-29 10:14:31",
      "Workflow Status": {
        "completed": 175706,
        "failed": 229,
        "cancelled": 3,
        "": 1
      },
      "Total Projects": 113,
      "Total Libraries": 13458,
      "_id": "current"
    }
    ```

    Provides list of current stats including total number of workflows that are completed, failed, cancelled, running, total number of projects, and total number of libraries
    *   Can take in parameters {dateFrom, dateTo} and returns the workflow status totals that apply to that time interval (if no parameters are provided, returns stats for all dates)

*   CurrentStatsByProject
    ```
    {
      "6": {
        "Workflow Status": {
          "completed": 18
        },
        "Project Name": "PancreaticCellLineSequencing",
        "Project Libraries": 2,
        "Date From": "Unspecified",
        "Date To": "2016-02-29 10:07:32"
      },
      "_id": "6"
    }
    ```

    Organized by projectSWID, provides list of current stats including project name, workflows and their status totals, number of library samples
    *   Can take in parameters {dateFrom, dateTo} and returns the worklflow status totals that apply to that time interval (if no parameters are provided, returns stats for all dates)

*   DonorInfo
    ```
    {
      "BLBC_0001": {
        "External Name": "6175",
        "Tissue Types": {
          "R": 1
        },
        "SWID": [
          "1171"
        ]
      },
      "_id": "BLBC_0001"
    }
    ```

    Organized by donor name, provides the external name, number of libraries per tissue type

*   DonorsByProject
    ```
    {
      "4": {
        "Project Name": "ICGCPancreaticCancerSeq",
        "Donors": [
          "PCSI_0013",
          "PCSI_0005",
          "PCSI_0014",
          "PCSI_0012",
          "PCSI_0024",
          "PCSI_0007",
          "PCSI_0006"
        ]
      },
      "_id": "4"
    }
    ```

    Organized by project SWID, each entry contains the project name and an array of associated donors

*   InstrumentNameByDonor
    ```
    {
      "ACC_0002": {
        "Instruments": [
          "h801"
        ],
        "SWID": [
          "907",
          "932"
        ]
      },
      "_id": "ACC_0002"
    }
    ```

    Organized by donor name, each entry contains an array of instruments that the donor sample has been seqeunced on

*   LastModifiedProjects
    ```
    {
      "63": {
        "Project Name": "PCSI",
        "Last Modified": "2016-01-23 07:35:26"
      },
      "90": {
        "Project Name": "CPC-GENE",
        "Last Modified": "2016-01-11 23:04:34"
      },
      "288147": {
        "Project Name": "HALT",
        "Last Modified": "2016-01-06 21:06:36"
      },
      "327091": {
        "Project Name": "Rapid_Autopsy_Metastatic_Panc",
        "Last Modified": "2016-01-01 09:53:40"
      },
      "1236599": {
        "Project Name": "DCIS",
        "Last Modified": "2016-01-13 22:53:14"
      },
      "1349398": {
        "Project Name": "EPICLiran",
        "Last Modified": "2016-01-08 21:21:19"
      },
      "1753531": {
        "Project Name": "Liposarcoma_Sequencing",
        "Last Modified": "2016-01-20 14:40:51"
      },
      "1861831": {
        "Project Name": "GECCOSequencing",
        "Last Modified": "2016-01-23 09:46:22"
      },
      "1988216": {
        "Project Name": "EACdysplasia",
        "Last Modified": "2016-01-20 01:08:43"
      },
      "2194176": {
        "Project Name": "test",
        "Last Modified": "2016-01-23 07:37:52"
      },
      "2690872": {
        "Project Name": "SingleCellRNAMedulloblastoma",
        "Last Modified": "2016-01-06 00:37:21"
      },
      "2904368": {
        "Project Name": "CatherineOBrienExomes",
        "Last Modified": "2016-01-13 17:43:55"
      },
      "2904369": {
        "Project Name": "PlycytemiaVera",
        "Last Modified": "2016-01-22 22:20:26"
      },
      "3473424": {
        "Project Name": "CellLineAML",
        "Last Modified": "2016-02-29 10:12:52"
      },
      "": {
        "Project Name": "",
        "Last Modified": "2016-01-23 02:35:08"
      },
      "Date": "2016-02-29 10:22:09",
      "_id": "lastMod_60_days"
    }
    ```

    Returns a list of project SWIDs and their project names and last modified dates
    *   Can take in a date range (i.e., 30 days and will return the list of modified projects in the last 30 days)

*   LibrariesByProject
    ```
    {
      "4": {
        "Project Name": "ICGCPancreaticCancerSeq",
        "Libraries": [
          "PCSI_0005_Pa_P_PE_456_WG",
          "PCSI_0006_Pa_P_PE_450_WG",
          "PCSI_0006_Pa_C_PE_536_WG",
          "PCSI_0007_Pa_P_PE_494_WG",
          "PCSI_0024_Pa_X_MP_405_WG",
          "PCSI_0024_Pa_C_MP_405_WG",
          "PCSI_0024_Pa_P_MP_405_WG",
          "PCSI_0013_Pa_C_MP_405_WG",
          "PCSI_0024_Pa_X_PE_500_WG",
          "PCSI_0014_Pa_C_MP_405_WG",
          "PCSI_0012_Pa_C_MP_405_WG"
        ]
      },
      "_id": "4"
    }
    ```

    Organized by project SWID, returns the project name and an array of the associated libraries to that project

*   LibrariesByRun
    ```
    {
      "7935": {
        "Libraries": {
          "PCSI_0024_Pa_X_MP_405_WG": "95",
          "PCSI_0024_Pa_P_MP_405_WG": "94"
        },
        "Run Name": "100606_i580_61UA6_LT"
      },
      "_id": "7935"
    }
    ```

    Organized by run SWID, returns the list of libraries on that run and the library sample SWIDs

*   LibraryInfo
    ```
    {
      "94": {
        "Library Name": "PCSI_0024_Pa_P_MP_405_WG",
        "Library Type": "WG",
        "Tissue Type": "P",
        "Tissue Origin": "Pa"
      },
      "_id": "94"
    }
    ```

    Organized by sample SWID, returns the library name, type, tissue type, origin

*   NumDonorsByProject
    ```
    {
      "4": {
        "Donors": {
          "PCSI": 7
        },
        "Project Name": "ICGCPancreaticCancerSeq"
      },
      "_id": "4"
    }
    ```

    Organized by project SWID, returns the project name and a list of the libraries associated with that project along with the number of libraries per donor

*   NumLibrariesByProject
    ```
    {
      "4": {
        "Project Name": "ICGCPancreaticCancerSeq",
        "Libraries": 11
      },
      "_id": "4"
    }
    ```

    Organized by project SWID, returns the project name and the number of libraries associated with that project

*   NumOfLibraryTypeByDonor
    ```
    {
      "OVCA_0006": {
        "Library Type": {
          "WT": 1,
          "EX": 1,
          "MR": 1
        },
        "SWID": [
          "1741",
          "1835",
          "295410"
        ]
      },
      "_id": "OVCA_0006"
    }
    ```

    Organized by donor name, returns the number of libraries under each library type

*   RNASeqQCDataByLibraryByRun
    ```
    {
      "Run": {
        "140926_SN802_0204_AC5JLPACXX": {
          "Library": {
            "ERNA_0041_nn_C_PE_398_WT": {
              "Total Reads (including unaligned)": "153650668",
              "Uniq Reads": "407818",
              "Reads Per Start Point": "3.37",
              "Passed Filter Bases": "30586350",
              "Passed Filter Aligned Bases": "30584373",
              "Coding Bases": "3919059",
              "UTR Bases": "2381864",
              "Intronic Bases": "7478793",
              "Intergenic Bases": "16804657",
              "Correct Strand Reads": "79162",
              "Incorrect Strand Reads": "457",
              "Proportion Coding Bases": "0.128139",
              "Proportion UTR Bases": "0.077878",
              "Proportion Intronic Bases": "0.24453",
              "Proportion Intergenic Bases": "0.549452",
              "Proportion mRNA Bases": "0.206018",
              "Proportion Usable Bases": "0.206004",
              "Proportion Correct Strand Reads": "0.99426",
              "Median CV Coverage": "0.920239",
              "Median 5Prime Bias": "0.436754",
              "Median 3Prime Bias": "0.809127",
              "Median 5Prime to 3Prime Bias": "0.854082",
              "rRNA Contamination (%reads aligned)": "0.26"
            }
          }
        }
      },
      "_id": "140926_SN802_0204_AC5JLPACXX_ERNA_0041_nn_C_PE_398_WT"
    }
    ```

    Organized by run, returns libraries and the RNA details for alignment QC
    Note: the _id is the runName_library

*   ReportDataByLibraryByLaneByDonor
    ```
    {
      "BLBC_0005": {
        "Lane": {
          "5": {
            "Library": {
              "BLBC_0005_Ly_R_PE_445_EX": {
                "Barcode": "CGATGT",
                "Run Name": "110819_SN393_0183_AB02B9ACXX",
                "Reads/SP": "2.43",
                "Map %": "88.44%",
                "Raw Reads": 384666138,
                "Raw Yield": 38851191316,
                "% on Target": "48.71%",
                "Insert Mean": "316.81",
                "Insert Stdev": "24.97",
                "Read Length": "101,101",
                "Coverage (collapsed)": "135.85",
                "Coverage (raw)": "330.12"
              }
            }
          }
        }
      },
      "_id": "BLBC_0005_5_BLBC_0005_Ly_R_PE_445_EX"
    }
    ```

    Organized by donor name, returns the lane and the library associated with it and the corresponding wide instrument report data (for the details page)
    Note: the _id is the donorName_lane_library

*   ReportDataByLibraryByLaneByRun
    ```
    {
      "Run": {
        "110525_SN801_0052_Bb01n6acxx": {
          "Lane": {
            "8": {
              "Library": {
                "PCSI_0069_Ly_R_PE_392_EX": {
                  "Barcode": "NoIndex",
                  "Reads/SP": "1.06",
                  "Map %": "86.55%",
                  "Raw Reads": 204034290,
                  "Raw Yield": 20607432365,
                  "% on Target": "50.35%",
                  "Insert Mean": "261.11",
                  "Insert Stdev": "38.08",
                  "Read Length": "101,101",
                  "Coverage (collapsed)": "160.78",
                  "Coverage (raw)": "170.42",
                  "% Mouse Content": "N/A"
                }
              }
            }
          }
        }
      },
      "_id": "110525_SN801_0052_Bb01n6acxx_8_PCSI_0069_Ly_R_PE_392_EX"
    }
    ```

    Organized by run name, returns lane, library and wide instrument report data for the library by lane by run details page
    Note: the _id is the runName_lane_library

*   RunDataByProject
    ```
    {
      "6": {
        "Run": {
          "610219": {
            "Donor": {
              "PCSI": 1
            },
            "Analysis Status": {
              "Alignment": {
                "completed": 1
              },
              "Base calling": {
                "completed": 1
              },
              "Quality Control": {
                "completed": 7
              },
              "Variant Calling": {
                
              }
            },
            "Run Name": "130923_M00753_0059_000000000-A42TJ"
          },
          "610222": {
            "Donor": {
              "PCSI": 1
            },
            "Analysis Status": {
              "Alignment": {
                "completed": 1
              },
              "Base calling": {
                "completed": 1
              },
              "Quality Control": {
                "completed": 7
              },
              "Variant Calling": {
                
              }
            },
            "Run Name": "130923_M00146_0029_000000000-A42PY"
          }
        },
        "Last Modified": "2015-08-15 06:52:37",
        "Project Name": "PancreaticCellLineSequencing"
      },
      "_id": "6"
    }
    ```

    Organized by project SWID, returns list of runs with run name, associated donors : library count and associated workflow run analysis status count

*   StartDateByProject
    ```
    {
      "6": {
        "Project Name": "PancreaticCellLineSequencing",
        "Start Date": "2013-08-13"
      },
      "_id": "6"
    }
    ```

    Organized by project SWID, returns the start date of the project

*   StartEndDateByDonor
    ```
    {
      "BLBC_0013": {
        "SWID": [
          "957"
        ],
        "End Date": "2012-01-06 17:41:35",
        "Start Date": "2011-03-25"
      },
      "_id": "BLBC_0013"
    }
    ```

    Organized by donor name and returns start date (date of donor sample in lab) and end date (last modified)

*   WorkflowByLibrary
    ```
    {
      "94": {
        "Library Name": "PCSI_0024_Pa_P_MP_405_WG",
        "Workflow Run": {
          "25831": {
            "File Paths": [
              "/oicr/data/archive/i580/100606_I580_61UA6_LT/Data/Intensities/Bustard1.8.0a5_11-06-2010_mchan.2/GERALD_11-06-2010_mchan/s_1_2_sequence.txt.gz",
              "/oicr/data/archive/i580/100606_I580_61UA6_LT/Data/Intensities/Bustard1.8.0a5_11-06-2010_mchan.2/GERALD_11-06-2010_mchan/s_3_1_sequence.txt.gz",
              "/oicr/data/archive/i580/100606_I580_61UA6_LT/Data/Intensities/Bustard1.8.0a5_11-06-2010_mchan.2/GERALD_11-06-2010_mchan/s_4_1_sequence.txt.gz",
              "/oicr/data/archive/i580/100606_I580_61UA6_LT/Data/Intensities/Bustard1.8.0a5_11-06-2010_mchan.2/GERALD_11-06-2010_mchan/s_2_1_sequence.txt.gz",
              "/oicr/data/archive/i580/100606_I580_61UA6_LT/Data/Intensities/Bustard1.8.0a5_11-06-2010_mchan.2/GERALD_11-06-2010_mchan/s_3_2_sequence.txt.gz",
              "/oicr/data/archive/i580/100606_I580_61UA6_LT/Data/Intensities/Bustard1.8.0a5_11-06-2010_mchan.2/GERALD_11-06-2010_mchan/s_2_2_sequence.txt.gz",
              "/oicr/data/archive/i580/100606_I580_61UA6_LT/Data/Intensities/Bustard1.8.0a5_11-06-2010_mchan.2/GERALD_11-06-2010_mchan/s_4_2_sequence.txt.gz",
              "/oicr/data/archive/i580/100606_I580_61UA6_LT/Data/Intensities/Bustard1.8.0a5_11-06-2010_mchan.2/GERALD_11-06-2010_mchan/s_1_1_sequence.txt.gz"
            ],
            "Workflow Name": "FileImport",
            "Skip": "false",
            "End Date": "2012-01-06 17:41:34"
          }
        }
      },
      "_id": "94"
    }
    ```

    Organized by library SWID, returns the library name, list of workflow runs and their associated files, workflow name, skip, and end date

### Analysis YAML

The analysis YAML is a yml file that contains list of workflows that correspond to each analysis type (alignment, base calling, quality control, variant calling)

```
---
Alignment:
  BWA: 3326549
  BwaMem: 3490867
  GenomicAlignmentNovoalign: 940113
  GenomicAlignmentNovoalign_2: 1726998
  GenomicAlignmentNovoalign_V2.07.15b: 3478218
  RNAseqAligner-Tophat: 3500779
Base calling:
  CASAVA: 3504552
  CASAVA-RTA: 538774
  FileImport: 3215649
  Xenome: 3403815
Quality Control:
  BamQC: 3556289
  CoverageAnalysis: 3498310
  FastQC: 3504913
  FingerprintCollector: 3557655
  FusionDetection-Tophat: 3500783
  GCBias-OSW: 3549180
  RNAseqQc: 3502433
  SeqControl: 3549189
  TargetedSequencingQC: 1338647
Variant Calling:
  BamFilterMergeCollapse: 3371881
  Cufflinks: 3502421
  GATK: 1818184
  GATK3: 3239906
  GATKAnnotateAndSort: 678388
  GATKGenotypeGVCFs: 3285541
  GATKHaplotypeCaller: 3371982
  GATKRecalibrationAndVariantCalling: 17740
  GATKRecalibrationAndVariantCallingHg19Exomes: 654471
  GATKRecalibrationAndVariantCallingHg19WholeGenome: 554991
  MutectStrelka: 3324548
  SomaticClassifier: 640448
```

The script first parses the file provenance report and converts everything into an organized object/dictionary hash ( for explaining purposes, call it fprHash ).

## Methods
Each method has a sample output of data in JSON format --> Updating to mongodb

*   getCurrentStats (fprHash, dateFrom, dateTo)
    *   Example output: 

        ```{"Date From":"Unspecified","Date To":"2016-02-17 09:07:41","Workflow Status":{"completed":172592,"failed":229,"cancelled":3,"running":1,"":1},"Total Projects":112,"Total Libraries":13093}```

*   getCurrentStatsByProject (fprHash, dateFrom, dateTo, projectSWID)
    *   Example output:

        obj = getCurrentStatsByProject(fprData, '', '', '10');

       ```{"10":{"Workflow Status":{"completed":254,"failed":2},"Project Name":"ABvsInvitrogenReagentComp","Project Libraries":16},"Date From":"Unspecified","Date To":"2016-02-17 09:17:40"}```

*   getLastModifiedProjects (fprHash, dateRange) (dateRange is in number of days (e.g., last 30 days)
    *   Example output:

        obj = getLastModifiedProjects(fprData, 30);

        ```{"63":{"Project Name":"PCSI","Last Modified":"2016-02-10 11:01:35"},"1307389":{"Project Name":"EPICT","Last Modified":"2016-02-10 06:23:39"},"1753531":{"Project Name":"Liposarcoma_Sequencing","Last Modified":"2016-01-20 14:40:51"},"1861831":{"Project Name":"GECCOSequencing","Last Modified":"2016-02-08 08:10:46"},"1861832":{"Project Name":"GECCOTestSamples","Last Modified":"2016-02-05 15:40:54"},"1988216":{"Project Name":"EACdysplasia","Last Modified":"2016-02-08 20:11:03"},"2194176":{"Project Name":"test","Last Modified":"2016-01-26 14:36:22"},"2904369":{"Project Name":"PlycytemiaVera","Last Modified":"2016-01-22 22:20:26"},"":{"Project Name":"","Last Modified":"2016-02-08 16:34:10"}}```

*   getStartDateByProject (fprHash, projectSWID)
    *   Example output:
        
        obj = getStartDateByProject(fprData, '10');

        ```{"10":{"Project Name":"ABvsInvitrogenReagentComp","Start Date":"2012-02-27"}}```

    *   getStartDateAllProjects (fprHash)
        *   Example output:

            ```{"4":{"Project Name":"ICGCPancreaticCancerSeq","Start Date":"Unspecified"},"6":{"Project Name":"PancreaticCellLineSequencing","Start Date":"2013-08-13"},"7":{"Project Name":"DifferentialmicroRNAexpression","Start Date":"Unspecified"},"8":{"Project Name":"McPherson","Start Date":"Unspecified"},"10":{"Project Name":"ABvsInvitrogenReagentComp","Start Date":"2012-02-27"},"11":{"Project Name":"AdrenocorticalCancer","Start Date":"Unspecified"},"14":{"Project Name":"BasalLikeBreastCancer","Start Date":"2011-03-31"}}```

*   getAnalysisStatusByProject (fprHash, analysisYAMLFile, projectSWID)
    *   Example output:

        obj = getAnalysisStatusByProject(fprData, analysisYAML, '10');

        ```{"10":{"Workflow Runs":["CASAVA","GenomicAlignmentNovoalign","GATKRecalibrationAndVariantCalling","FileImport","CASAVA-RTA","GATKRecalibrationAndVariantCallingHg19Exomes","FastQC","BamQC","GATKAnnotateAndSort","SomaticClassifier","EGAUpload-OSW","FingerprintCollector","SeqControl"],"Analysis Status":{"Alignment":{"completed":23},"Base calling":{"completed":5},"Quality Control":{"failed":2,"completed":172},"Variant Calling":{"completed":53}},"Project Name":"ABvsInvitrogenReagentComp","Last Modified":"2015-11-09 03:30:54"}}```

    *   getAnalysisStatusAllProjects (fprHash, dateRange, analysisYAMLFile)
        *   Example output:

            obj = getAnalysisStatusAllProjects(fprData, 30, analysisYAML);

            ```{"63":{"Workflow Runs":["CASAVA","GenomicAlignmentNovoalign","GATKRecalibrationAndVariantCalling","FileImport","CASAVA-RTA","GATKRecalibrationAndVariantCallingHg19Exomes","GATKRecalibrationAndVariantCallingHg19WholeGenome","BamQC","FastQC","Xenome","GATKAnnotateAndSort","SomaticClassifier","EGAUpload-OSW","GenomicAlignmentNovoalign_2","GCBias-OSW","FusionDetection-Tophat","RNAseqAligner-Tophat","Cufflinks","RNAseqQc","BWA","SeqControl","FingerprintCollector","BamFilterMergeCollapse","GenomicAlignmentNovoalign_V2.07.15b","CoverageAnalysis",""],"Analysis Status":{"Alignment":{"completed":6372,"failed":116,"cancelled":2,"running":1},"Base calling":{"completed":1108,"failed":10},"Quality Control":{"completed":41247,"failed":3},"Variant Calling":{"completed":672,"failed":4}},"Project Name":"PCSI","Last Modified":"2016-02-10 11:01:35"}}```

*   getNumDonorsByProject (fprHash, projectSWID)
    *   Example output:

        obj = getNumDonorsByProject(fprData, '10');

        ```{"10":{"Project Name":"ABvsInvitrogenReagentComp","Donors":{"PCSI":8,"CPCG":4}}}```

    *   getNumDonorsAllProjects ( fprHash )
        *   Example output:

             ```{"4":{"Project Name":"ICGCPancreaticCancerSeq","Donors":{"PCSI":7}},"6":{"Project Name":"PancreaticCellLineSequencing","Donors":{"PCSI":1}},"7":{"Project Name":"DifferentialmicroRNAexpression","Donors":{"DMiE":10}},"8":{"Project Name":"McPherson","Donors":{"PCSI":3}},"10":{"Project Name":"ABvsInvitrogenReagentComp","Donors":{"PCSI":8,"CPCG":4}},"11":{"Project Name":"AdrenocorticalCancer","Donors":{"OVCA":1,"ACC":1}},"14":{"Project Name":"BasalLikeBreastCancer","Donors":{"BLBC":11}},"17":{"Project Name":"CelegansDNA","Donors":{"CELS":29}},"18":{"Project Name":"CelegansRNA","Donors":{"CELS":3}},"24":{"Project Name":"CoringStudy","Donors":{"PCSI":1}},"25":{"Project Name":"CRC","Donors":{"CRC":3}},"29":{"Project Name":"FamilialCancerStudy","Donors":{"FCSN":15}},"30":{"Project Name":"FamilialColonCancer","Donors":{"FCSG":3}},"31":{"Project Name":"FamilialPancreaticSequencing","Donors":{"FPS":18}},"35":{"Project Name":"HinerfeldWT","Donors":{"HWT":2}}}```

*   getDonorsByProject (fprHash, projectSWID)
    *   Example output:

        obj = getDonorsByProject(fprData, '10');

        ```{"10":{"Project Name":"ABvsInvitrogenReagentComp","Donors":["PCSI_0118","PCSI_0117","PCSI_0112","CPCG_0203","CPCG_0199","PCSI_0115","PCSI_0100","CPCG_0201","PCSI_0119","CPCG_0198","PCSI_0116","PCSI_0120"]}}```

*   getNumLibrariesByProject (fprHash, projectSWID)
    *   Example output:  

        obj = getNumLibrariesByProject(fprData, '10');

        ```{"10":{"Project Name":"ABvsInvitrogenReagentComp","Libraries":16}}```

    *   getNumLibrariesAllProjects (fprHash)
        *   Example output:

            ```{"4":{"Project Name":"ICGCPancreaticCancerSeq","Libraries":11},"6":{"Project Name":"PancreaticCellLineSequencing","Libraries":2},"7":{"Project Name":"DifferentialmicroRNAexpression","Libraries":10},"8":{"Project Name":"McPherson","Libraries":9},"10":{"Project Name":"ABvsInvitrogenReagentComp","Libraries":16},"11":{"Project Name":"AdrenocorticalCancer","Libraries":4},"14":{"Project Name":"BasalLikeBreastCancer","Libraries":13},"17":{"Project Name":"CelegansDNA","Libraries":34},"18":{"Project Name":"CelegansRNA","Libraries":6},"24":{"Project Name":"CoringStudy","Libraries":1},"25":{"Project Name":"CRC","Libraries":4},"29":{"Project Name":"FamilialCancerStudy","Libraries":15},"30":{"Project Name":"FamilialColonCancer","Libraries":3},"31":{"Project Name":"FamilialPancreaticSequencing","Libraries":20},"35":{"Project Name":"HinerfeldWT","Libraries":2}}```

*   getLibrariesByProject (fprHash, projectSWID)
    *   Example output:

        obj = getLibrariesByProject(fprData, '10');

        ```{"10":{"Project Name":"ABvsInvitrogenReagentComp","Libraries":["CPCG_0199_Pr_P_PE_335_WG","CPCG_0199_Pr_P_PE_391_WG","PCSI_0115_Ly_R_PE_449_EX","PCSI_0118_Sp_R_PE_432_EX","PCSI_0120_St_R_PE_420_EX","CPCG_0198_Pr_P_PE_332_WG","PCSI_0119_Sp_R_PE_428_EX","CPCG_0201_Pr_P_PE_369_WG","CPCG_0203_Pr_P_PE_320_WG","PCSI_0117_St_R_PE_434_EX","CPCG_0201_Pr_P_PE_349_WG","CPCG_0198_Pr_P_PE_354_WG","CPCG_0203_Pr_P_PE_340_WG","PCSI_0116_Sp_R_PE_444_EX","PCSI_0100_Ly_R_PE_446_EX","PCSI_0112_Ly_R_PE_446_EX"]}}```

*   getRunDataAllProjects (fprHash, dateFrom, dateTo, analysisYAML)
    *   Example output:

        obj = getRunDataPerProject(fprData, '2015-01-01 00:00:00', '', analysisYAML);

        ```{"6":{"Project Name":"PancreaticCellLineSequencing","Run":{"610219":{"Run Name":"130923_M00753_0059_000000000-A42TJ","Donor":{"PCSI":1},"Analysis Status":{"Alignment":{"completed":1},"Base calling":{"completed":1},"Quality Control":{"completed":7},"Variant Calling":{}}},"610222":{"Run Name":"130923_M00146_0029_000000000-A42PY","Donor":{"PCSI":1},"Analysis Status":{"Alignment":{"completed":1},"Base calling":{"completed":1},"Quality Control":{"completed":7},"Variant Calling":{}}}},"Last Modified":"2015-08-15 06:52:37"},"8":{"Project Name":"McPherson","Run":{"126023":{"Run Name":"090430_I280_302DW_5","Donor":{"PCSI":3},"Analysis Status":{"Alignment":{},"Base calling":{"completed":2},"Quality Control":{},"Variant Calling":{}}},"133942":{"Run Name":"090529_i095_303L4_LT","Donor":{"PCSI":1},"Analysis Status":{"Alignment":{},"Base calling":{"completed":1},"Quality Control":{},"Variant Calling":{}}},"154474":{"Run Name":"090527_I581_304RJ_LT","Donor":{"PCSI":2},"Analysis Status":{"Alignment":{"completed":3},"Base calling":{"completed":3},"Quality Control":{"completed":9},"Variant Calling":{}}},"156255":{"Run Name":"090609_i280_428C9_LT","Donor":{"PCSI":1},"Analysis Status":{"Alignment":{"completed":8},"Base calling":{"completed":8},"Quality Control":{"completed":24},"Variant Calling":{}}}},"Last Modified":"2015-10-22 08:24:36"}}```

*   getRunDataByProject (fprData, dateFrom, dateTo, projectSWID, analysisYAML)
    *   Example use:  

        obj = getRunDataByProject(fprData, '2015-01-01 00:00:00', '', '10', analysisYAML);

        ```{"10":{"Project Name":"ABvsInvitrogenReagentComp","Run":{"11624":{"Run Name":"111027_SN203_0127_BC08J8ACXX","Donor":{"PCSI":6},"Analysis Status":{"Alignment":{"completed":13},"Base calling":{"completed":2},"Quality Control":{"failed":1,"completed":74},"Variant Calling":{"completed":47}}},"16937":{"Run Name":"111110_h1080_0084_AC08UPACXX","Donor":{"PCSI":2},"Analysis Status":{"Alignment":{"completed":2},"Base calling":{"completed":2},"Quality Control":{"completed":23},"Variant Calling":{"completed":6}}},"218562":{"Run Name":"120525_h803_0088_AC0M4JACXX","Donor":{"CPCG":4},"Analysis Status":{"Alignment":{"completed":8},"Base calling":{"completed":1},"Quality Control":{"failed":1,"completed":80},"Variant Calling":{}}}},"Last Modified":"2015-11-09 03:30:54"}}```

*   getLibrariesByRun (fprHash, runSWID)
    *   Example output:

        obj = getLibrariesByRun(fprData, '8002');

        ```{"8002":{"Run Name":"110525_SN801_0052_Bb01n6acxx","Libraries":{"POP_092_Li_X_PE_350_EX":"871","ACC_0002_Ki_P_PE_418_WG":"108","POP_107_Li_X_PE_350_EX":"874","POP_090_Li_X_PE_350_EX":"872","POP_077_Li_X_PE_350_EX":"873","ACC_0002_Ki_P_PE_342_WG":"109","PCSI_0069_Ly_R_PE_392_EX":"522","POP_067_Li_X_PE_350_EX":"869"}}}```

    *   getLibrariesAllRuns (fprHash)
        *   Example output:

            ```{"7935":{"Run Name":"100606_i580_61UA6_LT","Libraries":{"PCSI_0024_Pa_X_MP_405_WG":"95","PCSI_0024_Pa_P_MP_405_WG":"94"}},"7952":{"Run Name":"100606_i581_61U25_LT","Libraries":{"PCSI_0012_Pa_C_MP_405_WG":"96","PCSI_0013_Pa_C_MP_405_WG":"97","PCSI_0014_Pa_C_MP_405_WG":"98","PCSI_0024_Pa_C_MP_405_WG":"99"}},"7993":{"Run Name":"110601_SN804_0052_BC00VHACXX","Libraries":{"POP_090_Li_X_PE_350_EX":"872"}},"8002":{"Run Name":"110525_SN801_0052_Bb01n6acxx","Libraries":{"POP_092_Li_X_PE_350_EX":"871","ACC_0002_Ki_P_PE_418_WG":"108","POP_107_Li_X_PE_350_EX":"874","POP_090_Li_X_PE_350_EX":"872","POP_077_Li_X_PE_350_EX":"873","ACC_0002_Ki_P_PE_342_WG":"109","PCSI_0069_Ly_R_PE_392_EX":"522","POP_067_Li_X_PE_350_EX":"869"}}```

*   getAnalysisStatusByLibrary (fprHash, analysisYAMLFile, sampleSWID)
    *   Example output:

        obj = getAnalysisStatusByLibrary(fprData, analysisYAML, '133');

        ```{"133":{"Workflow Runs":["CASAVA","GenomicAlignmentNovoalign","BamQC","FastQC"],"Analysis Status":{"Alignment":{"completed":1},"Base calling":{"completed":1},"Quality Control":{"completed":4},"Variant Calling":{}},"Library Name":"BLBC_0006_Ly_R_PE_443_EX","Last Modified":"2013-09-10 02:11:19"}}```

    *   getAnalysisStatusAllLibraries (fprHash, dateRange, analysisYAMLFile)
        *   Example output:

            ```{"1959416":{"Workflow Runs":["CASAVA","FastQC","GenomicAlignmentNovoalign_V2.07.15b","SeqControl","GCBias-OSW","BamQC","FingerprintCollector","CoverageAnalysis","BwaMem","BamFilterMergeCollapse","GATKHaplotypeCaller","GATKGenotypeGVCFs","MutectStrelka"],"Analysis Status":{"Alignment":{"completed":5},"Base calling":{"completed":3},"Quality Control":{"completed":22},"Variant Calling":{"completed":4}},"Library Name":"LSP_0001_Ad_P_PE_316_WG","Last Modified":"2016-01-20 12:30:00"},"1959417":{"Workflow Runs":["CASAVA","FastQC","GenomicAlignmentNovoalign_V2.07.15b","FingerprintCollector","GCBias-OSW","BamQC","SeqControl","CoverageAnalysis","BwaMem","BamFilterMergeCollapse","GATKHaplotypeCaller","GATKGenotypeGVCFs","MutectStrelka"],"Analysis Status":{"Alignment":{"completed":5},"Base calling":{"completed":3},"Quality Control":{"completed":22},"Variant Calling":{"completed":4}},"Library Name":"LSP_0001_Ad_P_PE_315_WG","Last Modified":"2016-01-20 12:30:00"}}```

*   getLibraryInfoBySWID (fprHash, sampleSWID)
    *   Example output:

        obj = getLibraryInfoBySWID(fprData, '165');

        ```{"165":{"Library Name":"CRC_0001_Li_R_SE_200_MR","Library Type":"MR","Tissue Type":"R","Tissue Origin":"Li"}}```

    *   getLibraryInfo (fprHash)
        *   Example output:

            ```{"94":{"Library Name":"PCSI_0024_Pa_P_MP_405_WG","Library Type":"WG","Tissue Type":"P","Tissue Origin":"Pa"},"95":{"Library Name":"PCSI_0024_Pa_X_MP_405_WG","Library Type":"WG","Tissue Type":"X","Tissue Origin":"Pa"},"96":{"Library Name":"PCSI_0012_Pa_C_MP_405_WG","Library Type":"WG","Tissue Type":"C","Tissue Origin":"Pa"},"97":{"Library Name":"PCSI_0013_Pa_C_MP_405_WG","Library Type":"WG","Tissue Type":"C","Tissue Origin":"Pa"}}```

*   getWorkflowByLibrary (fprHash, sampleSWID)  
    *   Example output:

        obj = getWorkflowByLibrary(fprData, '133');

        ```{"165":{"Library Name":"CRC_0001_Li_R_SE_200_MR","Workflow Run":{"25831":{"File Paths":["/oicr/data/archive/i581/110218_I581_00030_612RT_LT/Data/Intensities/Bustard1.8.0_24-02-2011_rdenroche/GERALD_24-02-2011_rdenroche/s_4_sequence.txt.gz","/oicr/data/archive/i581/110218_I581_00030_612RT_LT/Data/Intensities/Bustard1.8.0_24-02-2011_rdenroche/GERALD_24-02-2011_rdenroche/s_1_sequence.txt.gz","/oicr/data/archive/i581/110218_I581_00030_612RT_LT/Data/Intensities/Bustard1.8.0_24-02-2011_rdenroche/GERALD_24-02-2011_rdenroche/s_2_sequence.txt.gz","/oicr/data/archive/i581/110218_I581_00030_612RT_LT/Data/Intensities/Bustard1.8.0_24-02-2011_rdenroche/GERALD_24-02-2011_rdenroche/s_3_sequence.txt.gz"],"Workflow Name":"FileImport","Skip":"false","End Date":"2012-01-06 17:41:27"}}}}```

    *   getWorkflowAllLibraries (fprHash)
        *   Example output:

            ```{"94":{"Library Name":"PCSI_0024_Pa_P_MP_405_WG","Workflow Run":{"25831":{"File Paths":["/oicr/data/archive/i580/100606_I580_61UA6_LT/Data/Intensities/Bustard1.8.0a5_11-06-2010_mchan.2/GERALD_11-06-2010_mchan/s_1_2_sequence.txt.gz","/oicr/data/archive/i580/100606_I580_61UA6_LT/Data/Intensities/Bustard1.8.0a5_11-06-2010_mchan.2/GERALD_11-06-2010_mchan/s_3_1_sequence.txt.gz","/oicr/data/archive/i580/100606_I580_61UA6_LT/Data/Intensities/Bustard1.8.0a5_11-06-2010_mchan.2/GERALD_11-06-2010_mchan/s_4_1_sequence.txt.gz","/oicr/data/archive/i580/100606_I580_61UA6_LT/Data/Intensities/Bustard1.8.0a5_11-06-2010_mchan.2/GERALD_11-06-2010_mchan/s_2_1_sequence.txt.gz","/oicr/data/archive/i580/100606_I580_61UA6_LT/Data/Intensities/Bustard1.8.0a5_11-06-2010_mchan.2/GERALD_11-06-2010_mchan/s_3_2_sequence.txt.gz","/oicr/data/archive/i580/100606_I580_61UA6_LT/Data/Intensities/Bustard1.8.0a5_11-06-2010_mchan.2/GERALD_11-06-2010_mchan/s_2_2_sequence.txt.gz","/oicr/data/archive/i580/100606_I580_61UA6_LT/Data/Intensities/Bustard1.8.0a5_11-06-2010_mchan.2/GERALD_11-06-2010_mchan/s_4_2_sequence.txt.gz","/oicr/data/archive/i580/100606_I580_61UA6_LT/Data/Intensities/Bustard1.8.0a5_11-06-2010_mchan.2/GERALD_11-06-2010_mchan/s_1_1_sequence.txt.gz"],"Workflow Name":"FileImport","Skip":"false","End Date":"2012-01-06 17:41:34"}}},"95":{"Library Name":"PCSI_0024_Pa_X_MP_405_WG","Workflow Run":{"25831":{"File Paths":["/oicr/data/archive/i580/100606_I580_61UA6_LT/Data/Intensities/Bustard1.8.0a5_11-06-2010_mchan.2/GERALD_11-06-2010_mchan/s_7_2_sequence.txt.gz","/oicr/data/archive/i580/100606_I580_61UA6_LT/Data/Intensities/Bustard1.8.0a5_11-06-2010_mchan.2/GERALD_11-06-2010_mchan/s_8_1_sequence.txt.gz","/oicr/data/archive/i580/100606_I580_61UA6_LT/Data/Intensities/Bustard1.8.0a5_11-06-2010_mchan.2/GERALD_11-06-2010_mchan/s_8_2_sequence.txt.gz","/oicr/data/archive/i580/100606_I580_61UA6_LT/Data/Intensities/Bustard1.8.0a5_11-06-2010_mchan.2/GERALD_11-06-2010_mchan/s_6_1_sequence.txt.gz","/oicr/data/archive/i580/100606_I580_61UA6_LT/Data/Intensities/Bustard1.8.0a5_11-06-2010_mchan.2/GERALD_11-06-2010_mchan/s_7_1_sequence.txt.gz","/oicr/data/archive/i580/100606_I580_61UA6_LT/Data/Intensities/Bustard1.8.0a5_11-06-2010_mchan.2/GERALD_11-06-2010_mchan/s_5_2_sequence.txt.gz","/oicr/data/archive/i580/100606_I580_61UA6_LT/Data/Intensities/Bustard1.8.0a5_11-06-2010_mchan.2/GERALD_11-06-2010_mchan/s_6_2_sequence.txt.gz","/oicr/data/archive/i580/100606_I580_61UA6_LT/Data/Intensities/Bustard1.8.0a5_11-06-2010_mchan.2/GERALD_11-06-2010_mchan/s_5_1_sequence.txt.gz"],"Workflow Name":"FileImport","Skip":"false","End Date":"2012-01-06 17:41:19"}}}}```

*   getDonorInfoByName (fprHash, donorName)
    *   Example output:

        obj = getDonorInfoByName(fprData, 'PCSI_0625');

        ```{"PCSI_0625":{"External Name":"94988","Tissue Types":{"P":2,"R":1},"SWID":["3371664"],"Analysis Status":{"running":1}}}```

    *   getDonorInfo (fprHash)
        *   Example output:

            ```"GECCO_6559":{"External Name":"92664","Tissue Types":{"P":1},"SWID":["3371643"]},"GECCO_6564":{"External Name":"Identity","Tissue Types":{"P":1},"SWID":["3371654"]},"PCSI_0625":{"External Name":"94988","Tissue Types":{"P":2,"R":1},"SWID":["3371664"],"Analysis Status":{"running":1}},"GECCO_6602":{"External Name":"92815","Tissue Types":{"R":1,"P":1},"SWID":["3371691"]},"GECCO_6561":{"External Name":{},"Tissue Types":{"P":1},"SWID":["3371700"]},"GECCO_6554":{"External Name":{},"Tissue Types":{"P":1},"SWID":["3371707"]},"GECCO_6574":{"External Name":{},"Tissue Types":{"P":1},"SWID":["3371715"]},"GECCO_6600":{"External Name":"110040009581","Tissue Types":{"R":1,"P":1},"SWID":["3371721"]},"GECCO_6605":{"External Name":{},"Tissue Types":{"R":1,"P":1},"SWID":["3371732"]},"GECCO_6627":{"External Name":{},"Tissue Types":{"R":1,"P":1},"SWID":["3371743"]}}```

*   getNumLibrariesPerTissueByDonor (fprHash, donorName)
    *   Example output:

        obj = getNumLibrariesPerTissueByDonor(fprData, 'BLBC_0013');

        ```{"BLBC_0013":{"SWID":["957"],"Tissue":{"P":1,"R":1}}}```

    *   getNumLibrariesPerTissueAllDonors (fprHash)
        *   Example output:

        ```{"ACC_0002":{"SWID":["907","932"],"Tissue":{"R":1,"P":1}},"BLBC_0014":{"SWID":["939"],"Tissue":{"P":1}},"BLBC_0013":{"SWID":["957"],"Tissue":{"P":1,"R":1}},"BLBC_0012":{"SWID":["985"],"Tissue":{"P":1,"R":1}},"BLBC_0011":{"SWID":["1008"],"Tissue":{"R":1}},"BLBC_0010":{"SWID":["1030"],"Tissue":{"R":1}},"BLBC_0005":{"SWID":["1069"],"Tissue":{"R":1}},"BLBC_0004":{"SWID":["1102"],"Tissue":{"R":1}},"BLBC_0002":{"SWID":["1148"],"Tissue":{"R":1}},"BLBC_0001":{"SWID":["1171"],"Tissue":{"R":1}},"BLBC_0006_Ly_R_nn_3_D_1":{"SWID":["1209"],"Tissue":{"R":1}},"BLBC_0003_Ly_R_nn_3_D_1":{"SWID":["1211"],"Tissue":{"R":1}},"CELS_0012":{"SWID":["1213"],"Tissue":{"R":1}},"CELS_0011":{"SWID":["1217"],"Tissue":{"R":1}},"CELS_0009":{"SWID":["1225"],"Tissue":{"R":1}}}```

*   getNumOfLibraryTypeByDonor (fprHash, donorName)
    *   Example output:

        obj = getNumOfLibraryTypeByDonor(fprData, 'PCSI_0023');

        ```{"PCSI_0023":{"Library Type":{"WG":6,"EX":2,"TS":2},"SWID":["2746","3742","48503","295994","1328068","1353659"]}}```

    *   getNumOfLibraryTypeAllDonors (fprHash)
        *   Example output:

            ```{"ACC_0002":{"Library Type":{"1":1,"WG":1},"SWID":["907","932"]},"BLBC_0014":{"Library Type":{"EX":1},"SWID":["939"]},"BLBC_0013":{"Library Type":{"EX":2},"SWID":["957"]},"BLBC_0012":{"Library Type":{"EX":2},"SWID":["985"]},"BLBC_0011":{"Library Type":{"EX":1},"SWID":["1008"]},"BLBC_0010":{"Library Type":{"EX":1},"SWID":["1030"]},"BLBC_0005":{"Library Type":{"EX":1},"SWID":["1069"]},"BLBC_0004":{"Library Type":{"EX":1},"SWID":["1102"]},"BLBC_0002":{"Library Type":{"EX":1},"SWID":["1148"]},"BLBC_0001":{"Library Type":{"EX":1},"SWID":["1171"]},"BLBC_0006_Ly_R_nn_3_D_1":{"Library Type":{"EX":1},"SWID":["1209"]},"BLBC_0003_Ly_R_nn_3_D_1":{"Library Type":{"EX":1},"SWID":["1211"]},"CELS_0012":{"Library Type":{"WG":1},"SWID":["1213"]},"CELS_0011":{"Library Type":{"WG":1},"SWID":["1217"]},"CELS_0009":{"Library Type":{"WG":1},"SWID":["1225"]}}```

*   getStartEndDateByDonor (fprHash, donorName)
    *   Example output:

        obj = getStartEndDateByDonor(fprData, 'PCSI_0023');

        ```{"PCSI_0023":{"SWID":["2746","3742","48503","295994","1328068","1353659"],"End Date":"2015-03-03 16:33:34","Start Date":"Unspecified"}}```

    *   getStartEndDateAllDonors (fprHash)
        *   Example output:

            ```{"ACC_0002":{"SWID":["907","932"],"End Date":"2013-01-01 19:37:03","Start Date":"Unspecified"},"BLBC_0014":{"SWID":["939"],"End Date":"2012-01-06 17:41:17","Start Date":"2011-03-25"},"BLBC_0013":{"SWID":["957"],"End Date":"2012-01-06 17:41:35","Start Date":"2011-03-25"},"BLBC_0012":{"SWID":["985"],"End Date":"2012-01-06 17:41:31","Start Date":"2011-03-25"},"BLBC_0011":{"SWID":["1008"],"End Date":"2012-01-06 17:41:10","Start Date":"2011-03-25"},"BLBC_0010":{"SWID":["1030"],"End Date":"2012-01-06 17:41:25","Start Date":"2011-03-25"},"BLBC_0005":{"SWID":["1069"],"End Date":"2013-09-09 21:58:43","Start Date":"Unspecified"},"BLBC_0004":{"SWID":["1102"],"End Date":"2012-01-06 17:40:51","Start Date":"2011-03-31"}}```

*   getInstrumentNamesByDonor (fprHash, donorName)
    *   Example output:

        obj = getInstrumentNamesByDonor(fprData, 'PCSI_0023');

        ```{"PCSI_0023":{"Instruments":["i581","i278","h804","h1179","h1080","h803","h802","h1068","h203","h239","h1205","M00753","M00146","D00353"],"SWID":["2746","3742","48503","295994","1328068","1353659"]}}```

    *   getInstrumentNamesAllDonors (fprHash)
        *   Example output:

            ```{"ACC_0002":{"Instruments":["h801"],"SWID":["907","932"]},"BLBC_0014":{"Instruments":["h801"],"SWID":["939"]},"BLBC_0013":{"Instruments":["h801","h203"],"SWID":["957"]},"BLBC_0012":{"Instruments":["h801","h203"],"SWID":["985"]},"BLBC_0011":{"Instruments":["h801"],"SWID":["1008"]},"BLBC_0010":{"Instruments":["h801"],"SWID":["1030"]},"BLBC_0005":{"Instruments":["h393"],"SWID":["1069"]},"BLBC_0004":{"Instruments":["h801"],"SWID":["1102"]},"BLBC_0002":{"Instruments":["h801"],"SWID":["1148"]},"BLBC_0001":{"Instruments":["h801"],"SWID":["1171"]},"BLBC_0006_Ly_R_nn_3_D_1":{"Instruments":["h393"],"SWID":["1209"]}}```

Note: this page is a work in progress
