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

FPR=$1
TMP=$2

node QCScripts/qc-extract.js $FPR $TMP

i="0"
max=$(cat tmp/newQCData.json | jq '.' | grep "iusswid" | wc -l)

while [ $i -lt $max ]
do
echo "here"
#echo $(cat $TMP/newQCData.json | jq '.['$i'].JSON' -r | grep -v null)
node QCScripts/qc-transform.js $(cat $TMP/newQCData.json | jq '.['$i'].sampleType' -r) $(cat $TMP/newQCData.json | jq '.['$i'].JSON' -r | grep -v null) $(cat $TMP/newQCData.json | jq '.['$i'].RNAZipFile' -r | grep -v null) $(cat $TMP/newQCData.json | jq '.['$i'].iusswid' -r) $TMP $(cat $TMP/newQCData.json | jq '.['$i'].XenomeFile' -r | grep -v null)
i=$[$i+1]
done

echo "starting loading"


for i in $(ls $TMP | grep "qc-"); do node QCScripts/qc-load.js $TMP/$i; done
 
module.exports = config;

```

