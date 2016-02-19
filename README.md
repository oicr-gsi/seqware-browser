# seqware-browser
API code for next gen seqware browser

The script first parses the file provenance report and converts everything into an organized object/dictionary hash ( for explaining purposes, call it fprHash ).

### Methods

*   getCurrentStats (fprHash, dateFrom, dateTo)
    *   Example output: 

        <ac:structured-macro ac:macro-id="4b52bc30-4e89-4b67-a208-a5b41d8c744b" ac:name="code" ac:schema-version="1"><ac:plain-text-body></ac:plain-text-body></ac:structured-macro>
*   getCurrentStatsByProject (fprHash, dateFrom, dateTo, projectSWID)
    *   Example output:

        obj = getCurrentStatsByProject(fprData, '', '', '10');

        <ac:structured-macro ac:macro-id="822ead29-c4af-4f67-abbd-81daeea29bd1" ac:name="code" ac:schema-version="1"><ac:plain-text-body></ac:plain-text-body></ac:structured-macro>

*   getLastModifiedProjects (fprHash, dateRange) (dateRange is in number of days (e.g., last 30 days)
    *   Example output:

        obj = getLastModifiedProjects(fprData, 30);

        <ac:structured-macro ac:macro-id="45fa6d07-309c-494b-bc48-5a544c734758" ac:name="code" ac:schema-version="1"><ac:plain-text-body></ac:plain-text-body></ac:structured-macro>
*   getNumDonorsByProject (fprHash, projectSWID)

*   *   getNumDonorsAllProjects ( fprHash )
    *   *   Example output:

            <ac:structured-macro ac:macro-id="ba1673c4-2f2f-4ee9-988b-f9aa61cd99b9" ac:name="code" ac:schema-version="1"><ac:plain-text-body></ac:plain-text-body></ac:structured-macro>
    *   Example output:

        obj = getNumDonorsByProject(fprData, '10');

        <ac:structured-macro ac:macro-id="e3e4f27c-6f9e-4511-9060-69b18ab0099d" ac:name="code" ac:schema-version="1"><ac:plain-text-body></ac:plain-text-body></ac:structured-macro>
*   getDonorsByProject (fprHash, projectSWID)
    *   Example output:

        obj = getDonorsByProject(fprData, '10');

        <ac:structured-macro ac:macro-id="39716382-fb7a-417e-9ed2-d8b247c68693" ac:name="code" ac:schema-version="1"><ac:plain-text-body></ac:plain-text-body></ac:structured-macro>

*   getNumLibrariesByProject (fprHash, projectSWID)
    *   getNumLibrariesAllProjects (fprHash)
        *   Example output:

            <ac:structured-macro ac:macro-id="d0cc5ce4-d2d5-4a4b-ba39-6757a65e6414" ac:name="code" ac:schema-version="1"><ac:plain-text-body></ac:plain-text-body></ac:structured-macro>
    *   Example output:  
        obj = getNumLibrariesByProject(fprData, '10');

        <ac:structured-macro ac:macro-id="dd864853-c13b-4c46-bb8b-eb5a2a455b14" ac:name="code" ac:schema-version="1"><ac:plain-text-body></ac:plain-text-body></ac:structured-macro>
*   getLibrariesByProject (fprHash, projectSWID)
    *   Example output:

        obj = getLibrariesByProject(fprData, '10');

        <ac:structured-macro ac:macro-id="075cd154-4532-469d-91b9-bd6db15f7bcf" ac:name="code" ac:schema-version="1"><ac:plain-text-body></ac:plain-text-body></ac:structured-macro>
*   getRunDataAllProjects (fprHash, dateFrom, dateTo, analysisYAML)
*   *   Example output:

        obj = getRunDataPerProject(fprData, '2015-01-01 00:00:00', '', analysisYAML);

        <ac:structured-macro ac:macro-id="b300c76f-7839-45d7-a5be-44994a56e097" ac:name="code" ac:schema-version="1"><ac:plain-text-body></ac:plain-text-body></ac:structured-macro>
*   getRunDataByProject (fprData, dateFrom, dateTo, projectSWID, analysisYAML)
    *   Example use:  
        obj = getRunDataByProject(fprData, '2015-01-01 00:00:00', '', '10', analysisYAML);

        <ac:structured-macro ac:macro-id="6d71de3f-4581-43b0-9586-be43185acd93" ac:name="code" ac:schema-version="1"><ac:plain-text-body></ac:plain-text-body></ac:structured-macro>
*   getLibrariesByRun (fprHash, runSWID)
*   *   getLibrariesPerRun (fprHash)
        *   Example output:

            <ac:structured-macro ac:macro-id="7eac8a5f-0b04-401d-8aa4-303a06448b05" ac:name="code" ac:schema-version="1"><ac:plain-text-body></ac:plain-text-body></ac:structured-macro>
    *   Example output:

        obj = getLibrariesByRun(fprData, '8002');

        <ac:structured-macro ac:macro-id="d2cc3f48-46cd-4d72-b2c5-87d42d03d3f1" ac:name="code" ac:schema-version="1"><ac:plain-text-body></ac:plain-text-body></ac:structured-macro>
*   getWorkflowByLibrary (fprHash, sampleSWID, analysisYAML)  

    *   getWorkflowPerLibrary (fprHash, analysisYAML)
        *   Example output:

            <ac:structured-macro ac:macro-id="44ae2882-8ed9-4a82-8485-9d72ca403044" ac:name="code" ac:schema-version="1"><ac:plain-text-body></ac:plain-text-body></ac:structured-macro>
    *   Example output:

        obj = getWorkflowByLibrary(fprData, '133', analysisYAML);

        <ac:structured-macro ac:macro-id="d5773517-ae38-4beb-98d7-2d4da6f5a308" ac:name="code" ac:schema-version="1"><ac:plain-text-body></ac:plain-text-body></ac:structured-macro>
*   getNumLibraryPerTissuePerDonor (fprHash)
    *   Example output:

        <ac:structured-macro ac:macro-id="aa41e352-339d-44aa-af27-c8043fd76921" ac:name="code" ac:schema-version="1"><ac:plain-text-body></ac:plain-text-body></ac:structured-macro>

### Analysis YAML

The analysis YAML is a yml file that contains list of workflows that correspond to each analysis type (alignment, base calling, quality control, variant calling)

<ac:structured-macro ac:macro-id="e66e18d7-5ee3-4a8e-bf4d-7c6663cf72fd" ac:name="code" ac:schema-version="1"><ac:plain-text-body></ac:plain-text-body></ac:structured-macro>

Note: this page is a work in progress
