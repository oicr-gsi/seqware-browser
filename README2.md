seqware-browser
================
API code for next gen seqware browser

Redocumentation

All collection entries are organized by their respective SWID (expect for donor which is organized by name)

### Collections:

#### By Project (Project SWID)

*	RunDataByProject
	```
	{
	  "10889": {
	    "Run": {
	      "11761": {
	        "Donor": {
	          "HALO": 4
	        },
	        "Analysis Status": {
	          "Alignment": {
	            
	          },
	          "Base calling": {
	            "completed": 3
	          },
	          "Quality Control": {
	            
	          },
	          "Variant Calling": {
	            
	          }
	        },
	        "Run Name": "11-10-04_M00146_0006_A-A04CE"
	      },
	      "17259": {
	        "Donor": {
	          "HALO": 3
	        },
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
	        "Run Name": "11-10-25_M00146_0011_A-A0819"
	      },
	      "716935": {
	        "Donor": {
	          "HALT": 32
	        },
	        "Analysis Status": {
	          "Alignment": {
	            "completed": 32
	          },
	          "Base calling": {
	            "completed": 1
	          },
	          "Quality Control": {
	            "completed": 128
	          },
	          "Variant Calling": {
	            
	          }
	        },
	        "Run Name": "131115_SN1080_0157_BC37AVACXX"
	      },
	      "725060": {
	        "Donor": {
	          "HALT": 42
	        },
	        "Analysis Status": {
	          "Alignment": {
	            "completed": 64
	          },
	          "Base calling": {
	            "completed": 1
	          },
	          "Quality Control": {
	            "completed": 256
	          },
	          "Variant Calling": {
	            
	          }
	        },
	        "Run Name": "131121_SN801_0142_BC3H5AACXX"
	      },
	      "919499": {
	        "Donor": {
	          "PCSI": 7
	        },
	        "Analysis Status": {
	          "Alignment": {
	            "completed": 11
	          },
	          "Base calling": {
	            "completed": 1
	          },
	          "Quality Control": {
	            "completed": 33
	          },
	          "Variant Calling": {
	            
	          }
	        },
	        "Run Name": "140526_M00753_0003_000000000-A4N3P"
	      },
	      "997861": {
	        "Donor": {
	          "PCSI": 5
	        },
	        "Analysis Status": {
	          "Alignment": {
	            "completed": 8
	          },
	          "Base calling": {
	            "completed": 1
	          },
	          "Quality Control": {
	            "completed": 24
	          },
	          "Variant Calling": {
	            
	          }
	        },
	        "Run Name": "140730_M00753_0005_000000000-A551J"
	      },
	      "1265188": {
	        "Donor": {
	          "HALT": 2
	        },
	        "Analysis Status": {
	          "Alignment": {
	            "completed": 2
	          },
	          "Base calling": {
	            "completed": 1
	          },
	          "Quality Control": {
	            "completed": 6
	          },
	          "Variant Calling": {
	            "completed": 2
	          }
	        },
	        "Run Name": "141016_D00353_0080_AC4R0NANXX"
	      },
	      "1305952": {
	        "Donor": {
	          "PCSI": 5
	        },
	        "Analysis Status": {
	          "Alignment": {
	            "completed": 6
	          },
	          "Base calling": {
	            "completed": 1
	          },
	          "Quality Control": {
	            "completed": 18
	          },
	          "Variant Calling": {
	            
	          }
	        },
	        "Run Name": "141121_M00146_0010_000000000-A5517"
	      }
	    },
	    "Last Modified": "2015-09-29 01:14:41",
	    "Project Name": "HaloPlex",
	    "Num of Runs": 8
	  },
	  "_id": "10889"
	}
	```

	Wireframe: 6b

*	LibrariesByProject
	```
	{
	  "83": {
	    "Project Name": "TorontoLungCancerResequencing",
	    "Libraries": {
	      "9732": "TLCR_4C12_nn_n_PE_500_WG",
	      "9734": "TLCR_4C12_nn_n_PE_500_WG",
	      "9735": "TLCR_4C11_nn_n_PE_500_WG",
	      "9736": "TLCR_4C11_nn_n_PE_500_WG",
	      "9737": "TLCR_4C10_nn_n_PE_500_WG",
	      "9738": "TLCR_4C10_nn_n_PE_500_WG",
	      "9739": "TLCR_4C9_nn_n_PE_500_WG",
	      "9740": "TLCR_4C9_nn_n_PE_500_WG",
	      "9741": "TLCR_4C8_nn_n_PE_500_WG",
	      "9742": "TLCR_4C8_nn_n_PE_500_WG",
	      "9743": "TLCR_4C7_nn_n_PE_500_WG",
	      "9744": "TLCR_4C7_nn_n_PE_500_WG",
	      "9745": "TLCR_4C6_nn_n_PE_500_WG",
	      "9746": "TLCR_4C6_nn_n_PE_500_WG",
	      "9747": "TLCR_4C5_nn_n_PE_500_WG",
	      "9750": "TLCR_4C4_nn_n_PE_500_WG",
	      "9751": "TLCR_4C3_nn_n_PE_500_WG",
	      "9752": "TLCR_4C3_nn_n_PE_500_WG",
	      "9753": "TLCR_4C2_nn_n_PE_500_WG",
	      "9754": "TLCR_4C2_nn_n_PE_500_WG",
	      "9755": "TLCR_4C1_nn_n_PE_500_WG",
	      "9757": "TLCR_4R12_nn_n_PE_500_WG",
	      "9759": "TLCR_4R12_nn_n_PE_500_WG",
	      "9760": "TLCR_4R11_nn_n_PE_500_WG",
	      "9761": "TLCR_4R11_nn_n_PE_500_WG",
	      "9762": "TLCR_4R10_nn_n_PE_500_WG",
	      "9763": "TLCR_4R10_nn_n_PE_500_WG",
	      "9765": "TLCR_4R9_nn_n_PE_500_WG",
	      "9766": "TLCR_4R8_nn_n_PE_500_WG",
	      "9767": "TLCR_4R8_nn_n_PE_500_WG",
	      "9768": "TLCR_4R7_nn_n_PE_500_WG",
	      "9769": "TLCR_4R7_nn_n_PE_500_WG",
	      "9770": "TLCR_4R6_nn_n_PE_500_WG",
	      "9771": "TLCR_4R6_nn_n_PE_500_WG",
	      "9772": "TLCR_4R5_nn_n_PE_500_WG",
	      "9773": "TLCR_4R5_nn_n_PE_500_WG",
	      "9774": "TLCR_4R4_nn_n_PE_500_WG",
	      "9776": "TLCR_4R3_nn_n_PE_500_WG",
	      "9777": "TLCR_4R3_nn_n_PE_500_WG",
	      "9778": "TLCR_4R2_nn_n_PE_500_WG",
	      "9779": "TLCR_4R2_nn_n_PE_500_WG",
	      "9780": "TLCR_4R1_nn_n_PE_500_WG",
	      "9781": "TLCR_4R1_nn_n_PE_500_WG",
	      "10776": "TLCR_1C9_nn_n_PE_500_WG",
	      "10778": "TLCR_1C11_nn_n_PE_500_WG",
	      "10779": "TLCR_1C12_nn_n_PE_500_WG",
	      "10780": "TLCR_1R1_nn_n_PE_500_WG",
	      "10781": "TLCR_1R2_nn_n_PE_500_WG",
	      "10782": "TLCR_1R3_nn_n_PE_500_WG",
	      "10783": "TLCR_1R4_nn_n_PE_500_WG"
	    },
	    "Num Libraries": 50
	  },
	  "_id": "83"
	}
	```

	Wireframe: 5a, 8

*	DonorsByProject
	```
	{
	  "10851": {
	    "Donors": [
	      "TYER_0012",
	      "TYER_0010",
	      "TYER_0007",
	      "TYER_0006",
	      "TYER_0002",
	      "TYER_0009",
	      "TYER_0008",
	      "TYER_0005",
	      "TYER_0004",
	      "TYER_0003",
	      "TYER_0001"
	    ],
	    "Donor Totals": {
	      "TYER": 11
	    },
	    "Project Name": "DIA2_Yeast"
	  },
	  "_id": "10851"
	}
	```

	Wireframe: 5a, 8, 9a

*	StartDateByProject
	```
	{
	  "ACC": "2011-05-18 11:18:44",
	  "_id": "ACC"
	}
	```

	Wireframe: 8

#### By Run (Sequencer Run SWID)

*	RunInfo
	```
	{
	  "8327": {
	    "Library Totals": {
	      "OCBN": 15,
	      "PCSI": 4
	    },
	    "Donors": {
	      "OCBN_0011": 4,
	      "OCBN_0015": 4,
	      "OCBN_0012": 4,
	      "OCBN_0013": 3,
	      "PCSI_0045": 1,
	      "PCSI_0046": 1,
	      "PCSI_0044": 1,
	      "PCSI_0014": 1
	    },
	    "Donor Totals": {
	      "OCBN": 4,
	      "PCSI": 4
	    },
	    "Tissue Types": {
	      "X": 17,
	      "P": 2
	    },
	    "Library Types": {
	      "EX": 19
	    },
	    "Libraries": {
	      "8329": "OCBN_0011_Ov_X_PE_474_EX",
	      "8332": "OCBN_0015_Ov_X_PE_474_EX",
	      "8338": "OCBN_0012_Ov_X_PE_474_EX",
	      "8340": "OCBN_0011_Ov_X_PE_474_EX",
	      "8342": "OCBN_0011_Ov_X_PE_474_EX",
	      "8344": "OCBN_0011_Ov_X_PE_474_EX",
	      "8345": "OCBN_0012_Ov_X_PE_474_EX",
	      "8346": "OCBN_0012_Ov_X_PE_474_EX",
	      "8347": "OCBN_0012_Ov_X_PE_474_EX",
	      "8348": "OCBN_0013_Ov_X_PE_474_EX",
	      "8349": "OCBN_0013_Ov_X_PE_474_EX",
	      "8350": "OCBN_0013_Ov_X_PE_474_EX",
	      "8351": "OCBN_0015_Ov_X_PE_474_EX",
	      "8352": "OCBN_0015_Ov_X_PE_474_EX",
	      "8353": "OCBN_0015_Ov_X_PE_474_EX",
	      "9044": "PCSI_0045_Pa_X_PE_395_EX",
	      "9114": "PCSI_0046_Pa_P_PE_214_EX",
	      "9120": "PCSI_0044_Pa_P_PE_242_EX",
	      "9351": "PCSI_0014_Pa_X_PE_429_EX"
	    },
	    "Run Name": "110519_h239_0115_B808BJABXX",
	    "Num of libraries": 19
	  },
	  "_id": "8327"
	}
	```

	Wireframe: 6a, 6b, 7a, 7c

*	StartDateByRun
	```
	{
	  "120125_h802_0076_BC0FWAACXX": "2012-01-27 16:00:25",
	  "_id": "120125_h802_0076_BC0FWAACXX"
	}
	```

	Wireframe: 6a, 6b, 7a

*	NumCompletedWorkflowsEachDateByRun
	```
	{
	  "8576": {
	    "2012-01-06": {
	      "Completed Workflows": 8,
	      "Completed Libraries": 8,
	      "Libraries": {
	        "8578": "PCSI_0002_Ly_R_PE_350_WG",
	        "8580": "PCSI_0002_Ly_R_PE_500_WG",
	        "8582": "PCSI_0002_Pa_X_PE_350_WG",
	        "8584": "PCSI_0002_Pa_X_PE_500_WG",
	        "8586": "PCSI_0002_Pa_P_PE_350_WG",
	        "8588": "PCSI_0002_Pa_P_PE_500_WG",
	        "15691": "PCSI_0028_Pa_C_PE_350_WG",
	        "15693": "PCSI_0028_Pa_C_PE_500_WG"
	      },
	      "Run Name": "100506_i320_612NC_LT"
	    },
	    "2012-01-11": {
	      "Completed Workflows": 6,
	      "Completed Libraries": 6,
	      "Libraries": {
	        "8578": "PCSI_0002_Ly_R_PE_350_WG",
	        "8580": "PCSI_0002_Ly_R_PE_500_WG",
	        "8582": "PCSI_0002_Pa_X_PE_350_WG",
	        "8584": "PCSI_0002_Pa_X_PE_500_WG",
	        "8586": "PCSI_0002_Pa_P_PE_350_WG",
	        "8588": "PCSI_0002_Pa_P_PE_500_WG"
	      },
	      "Run Name": "100506_i320_612NC_LT"
	    }
	  },
	  "_id": "8576"
	}
	```

	Wireframe: 6a, 6b

#### By Library (IUSSWID)

*	LibraryInfo
	```
	{
	  "566881": {
	    "Run": {
	      "566875": "130619_SN7001205_0152_AH0F68ADXX"
	    },
	    "Library Name": "CLB_045_nn_n_SE_300_CH",
	    "Lane": "2",
	    "Barcode": "AGTTCC",
	    "Library Type": "CH",
	    "Tissue Type": "n",
	    "Tissue Origin": "nn"
	  },
	  "_id": "566881"
	}
	```

	Wireframe: 6a, 7a, 7c, 9a, 9b, 10a, 11

*   AnalysisStatusByLibrary
	```
	{
	  "148": {
	    "Workflow Runs": [
	      "FileImport"
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
	    "Barcode": "ATCACG",
	    "Lane": "2",
	    "Library Name": "CELS_0001_Wm_R_PE_464_WG",
	    "Last Modified": "2012-12-14 09:41:33"
	  },
	  "_id": "148"
	}
	```

	Wireframe: 6a, 9a

*	WorkflowByLibrary
	```
	{
	  "8199": {
	    "Workflow Run": {
	      "25831": {
	        "File Paths": [
	          "/oicr/data/archive/h803/110522_SN803_0046_AC01MAABXX/Data/Intensities/BaseCalls/qseq/demultiplex2/003/GERALD_06-06-2011_fyousif/s_6_2_sequence.txt.gz",
	          "/oicr/data/archive/h803/110522_SN803_0046_AC01MAABXX/Data/Intensities/BaseCalls/qseq/demultiplex2/002/GERALD_06-06-2011_fyousif/s_6_1_sequence.txt.gz",
	          "/oicr/data/archive/h803/110522_SN803_0046_AC01MAABXX/Data/Intensities/BaseCalls/qseq/demultiplex2/001/GERALD_06-06-2011_fyousif/s_4_2_sequence.txt.gz",
	          "/oicr/data/archive/h803/110522_SN803_0046_AC01MAABXX/Data/Intensities/BaseCalls/qseq/demultiplex2/004/GERALD_06-06-2011_fyousif/s_5_2_sequence.txt.gz",
	          "/oicr/data/archive/h803/110522_SN803_0046_AC01MAABXX/Data/Intensities/BaseCalls/qseq/demultiplex2/004/GERALD_06-06-2011_fyousif/s_1_2_sequence.txt.gz"
	        ],
	        "Workflow Name": "FileImport",
	        "Skip": "false",
	        "End Date": "2012-01-06 17:40:40",
	        "Analysis Type": "Base calling"
	      },
	      "394365": {
	        "File Paths": [
	          "/oicr/data/archive/h803/110522_SN803_0046_AC01MAABXX/Data/Intensities/BaseCalls/qseq/demultiplex2/unknown/GERALD_06-06-2011_fyousif/s_3_1_sequence.txt.gz",
	          "/oicr/data/archive/h803/110522_SN803_0046_AC01MAABXX/Data/Intensities/BaseCalls/qseq/demultiplex2/002/GERALD_06-06-2011_fyousif/s_5_2_sequence.txt.gz"
	        ],
	        "Workflow Name": "FileImport",
	        "Skip": "false",
	        "End Date": "2012-12-14 09:41:33",
	        "Analysis Type": "Base calling"
	      }
	    },
	    "Library Name": "FPS_0017_Ly_R_PE_479_EX",
	    "Num of workflow runs": 2
	  },
	  "_id": "8199"
	}
	```

	Wireframe: 7a, 9b, 10a

*	ReportDataByLibrary
	```
	{
	  "8060": {
	    "Library Name": "BLBC_0006_Ly_R_PE_443_EX",
	    "Data": {
	      "Barcode": "TTAGGC",
	      "Reads/SP": "3.09",
	      "Map %": "87.94%",
	      "Raw Reads": 439354072,
	      "Raw Yield": 44374736694,
	      "% on Target": "49.29%",
	      "Insert Mean": "314.17",
	      "Insert Stdev": "26.89",
	      "Read Length": "101,101",
	      "Coverage (collapsed)": "122.43",
	      "Coverage (raw)": "378.32",
	      "% Mouse Content": "N/A"
	    }
	  },
	  "_id": "8060"
	}
	```

	Wireframe: 7c, 10b, 11

*	RNASeqQCDataByLibrary
	```
	{
	  "1271390": {
	    "Library Name": "HALT_1679_Lv_P_PE_600_MR",
	    "Data": {
	      "Total Reads (including unaligned)": "70751904",
	      "Uniq Reads": "64043389",
	      "Reads Per Start Point": "3.37",
	      "Passed Filter Bases": "4803254175",
	      "Passed Filter Aligned Bases": "4802742132",
	      "Coding Bases": "1782298921",
	      "UTR Bases": "1319876853",
	      "Intronic Bases": "993225997",
	      "Intergenic Bases": "707340361",
	      "Correct Strand Reads": "Not a Strand Specific Library",
	      "Incorrect Strand Reads": "Not a Strand Specific Library",
	      "Proportion Coding Bases": "0.3711",
	      "Proportion UTR Bases": "0.274817",
	      "Proportion Intronic Bases": "0.206804",
	      "Proportion Intergenic Bases": "0.147278",
	      "Proportion mRNA Bases": "0.645918",
	      "Proportion Usable Bases": "0.645849",
	      "Proportion Correct Strand Reads": "Not a Strand Specific Library",
	      "Median CV Coverage": "0.537623",
	      "Median 5Prime Bias": "0.098685",
	      "Median 3Prime Bias": "0.427857",
	      "Median 5Prime to 3Prime Bias": "0.261178",
	      "rRNA Contamination (%reads aligned)": "0.73"
	    }
	  },
	  "_id": "1271390"
	}
	```

	Wireframe: 7c, 10b

*	SequencingStatusByLibrary
	```
	{
	  "974": {
	    "Library Name": "PCSI_0002_Pa_X_PE_nn_WG",
	    "Status": "Completed",
	    "Lane": 6
	  },
	  "_id": "974"
	}
	```

	Wireframe: 9a

#### By Donor (Donor Name)

*	DonorInfo
	```
	{
	  "PCSI_0103": {
	    "External Name": "63256",
	    "Institute": "Ontario Institute for Cancer Research",
	    "Libraries": [
	      {
	        "9598": "PCSI_0103_Pa_P_PE_435_EX"
	      },
	      {
	        "17242": "PCSI_0103_Ly_R_PE_425_EX"
	      },
	      {
	        "902686": "PCSI_0103_Pa_P_PE_673_WG"
	      },
	      {
	        "902688": "PCSI_0103_Pa_P_PE_614_WG"
	      },
	      {
	        "903695": "PCSI_0103_Si_R_PE_606_WG"
	      },
	      {
	        "903697": "PCSI_0103_Si_R_PE_628_WG"
	      },
	      {
	        "912422": "PCSI_0103_Pa_P_PE_673_WG"
	      },
	      {
	        "912424": "PCSI_0103_Pa_P_PE_673_WG"
	      },
	      {
	        "912426": "PCSI_0103_Pa_P_PE_614_WG"
	      },
	      {
	        "912428": "PCSI_0103_Pa_P_PE_614_WG"
	      },
	      {
	        "912448": "PCSI_0103_Si_R_PE_606_WG"
	      },
	      {
	        "912450": "PCSI_0103_Si_R_PE_628_WG"
	      },
	      {
	        "962707": "PCSI_0103_Pa_P_PE_614_WG"
	      },
	      {
	        "1278518": "RDBR_0002_nn_n_PE_300_TS"
	      },
	      {
	        "3065060": "PCSI_0103_Pa_P_PE_294_MR"
	      }
	    ],
	    "Library Total": 15,
	    "Library Types": {
	      "EX": 2,
	      "WG": 11,
	      "TS": 1,
	      "MR": 1
	    },
	    "SWID": [
	      "6271",
	      "902409",
	      "1278258",
	      "3064315"
	    ],
	    "Tissue Types": {
	      "P": 9,
	      "R": 5,
	      "n": 1
	    }
	  },
	  "_id": "PCSI_0103"
	}
	```

	Wireframe: 9a, 9b, 10a, 10b

#### By Run (Pinery run id - DIFFERENT FROM RUNSWID)
*	PipelineStatus
	```
	{
	  "2200": {
	    "State": "Failed",
	    "Run Name": "141127_M00753_0012_000000000-A5792",
	    "Start Date": "2014-12-02T11:07:05-05:00",
	    "Lanes": {
	      "1": {
	        "Samples": [
	          {
	            "id": 69282,
	            "Project": "EPICT",
	            "Library Name": "EPICT_0003_Pa_C_PE_537_TS"
	          },
	          {
	            "id": 69280,
	            "Project": "EPICT",
	            "Library Name": "EPICT_0001_Pa_C_PE_511_TS"
	          },
	          {
	            "id": 69284,
	            "Project": "EPICT",
	            "Library Name": "EPICT_0005_Pa_C_PE_526_TS"
	          },
	          {
	            "id": 69281,
	            "Project": "EPICT",
	            "Library Name": "EPICT_0002_Pa_C_PE_513_TS"
	          },
	          {
	            "id": 69283,
	            "Project": "EPICT",
	            "Library Name": "EPICT_0004_Pa_C_PE_540_TS"
	          },
	          {
	            "id": 69285,
	            "Project": "EPICT",
	            "Library Name": "EPICT_0006_Pa_C_PE_527_TS"
	          }
	        ]
	      }
	    },
	    "Projects": {
	      "EPICT": 6
	    }
	  },
	  "_id": "2200"
	}
	```

	Wireframe: 5a, 7a

#### By Date
*	WorkflowStatusLibrariesByDate
	```
	{
	  "2012-11-08": {
	    "Libraries": {
	      "8297": {
	        "Library Name": "OVCA_0005_Ov_C_PE_400_EX",
	        "Last Modified Workflow": "2012-11-08 11:47:33"
	      },
	      "8299": {
	        "Library Name": "OVCA_0006_Ov_C_PE_400_EX",
	        "Last Modified Workflow": "2012-11-08 11:47:33"
	      },
	      "8301": {
	        "Library Name": "OVCA_0008_Ov_C_PE_300_EX",
	        "Last Modified Workflow": "2012-11-08 11:47:33"
	      },
	      "8303": {
	        "Library Name": "OVCA_0011_Ov_C_PE_300_EX",
	        "Last Modified Workflow": "2012-11-08 11:47:33"
	      },
	      "288480": {
	        "Library Name": "CPCG_0158_Pr_P_PE_620_WG",
	        "Last Modified Workflow": "2012-11-08 03:46:18"
	      },
	      "288495": {
	        "Library Name": "CPCG_0117_Pr_P_PE_638_WG",
	        "Last Modified Workflow": "2012-11-08 04:42:19"
	      },
	      "288497": {
	        "Library Name": "CPCG_0117_Pr_P_PE_638_WG",
	        "Last Modified Workflow": "2012-11-08 00:10:11"
	      },
	      "298622": {
	        "Library Name": "CPCG_0154_Pr_P_PE_641_WG",
	        "Last Modified Workflow": "2012-11-08 03:41:54"
	      },
	      "298624": {
	        "Library Name": "CPCG_0206_Pr_P_PE_683_WG",
	        "Last Modified Workflow": "2012-11-08 04:28:17"
	      },
	      "298634": {
	        "Library Name": "CPCG_0166_Ly_R_PE_626_WG",
	        "Last Modified Workflow": "2012-11-08 04:44:08"
	      },
	      "298984": {
	        "Library Name": "CME_0004_St_R_PE_392_EX",
	        "Last Modified Workflow": "2012-11-08 02:19:53"
	      }
	    }
	  },
	  "_id": "2012-11-08"
	}
	```

	Wireframe: 6a, 6b, 9a, 9b

#### By Template id (the id that connects pinery to SeqWare Database)
*	NumSkipSeqPerLibraryByTemplateID
	```
	{
	  "2417": {
	    "Library Name": "POP_019_Li_C_PE_300_MR",
	    "Skip": 0
	  },
	  "_id": "2417"
	}
	{
	  "2418": {
	    "Library Name": "PCSI_0024_Ly_R_PE_357_EX",
	    "Skip": 1,
	    "Skipped Libs": [
	      {
	        "PCSI_0024_Ly_R_PE_357_EX": "100428_I581_61P4C_LT_lane_8"
	      }
	    ]
	  },
	  "_id": "2418"
	}
	```

	Wireframe: 7a, 7b, 10a