Update QC Collection
================

There are three sections to this process; finding the ids that need updating, making a json to match the requirements of the collection, and loading the data into MongoDB.

### qc-extract.js
This script finds what swids need to be added to the QC collection
input: file provenance report data, path to temporary directory
output: json file containing the swids paired with the paths to their details, and a dna/rna identification.

### qc-transform.js
puts the file provenance report data into the expected format for the collection. It will also generate the base64 graphs, leaving the png versions in the temporary directory specified
input: sample type (dna/rna), JSON/RNAZip file, swid, path to temporary directory, XenomeFile (if applicable)
output: json file

### qc-load.js
takes a given file and loads it into the MongoDB QC collection
input: transformed file



A possible way to run these scripts:
(from inside the main directory)

```
#!/bin/bash
set -euf -o pipefail

FPR=$1
TMP=$2

echo "making list"
node QCScripts/qc-extract.js "${FPR}" > "${TMP}/newQCData.txt"

echo "starting to generate json files"
while read -r p; do 
  node QCScripts/qc-transform.js "${TMP}" $p
done <"${TMP}/newQCData.txt"

echo "starting loading"
for i in $(ls "${TMP}" | grep ".json"); do
  node QCScripts/qc-load.js "${TMP}/${i}"
done

```

