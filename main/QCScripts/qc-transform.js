//arguments: sampleType, json/zipFile, IUSSWID, path to tmp dir for charts, xenomeFile,
// n/a for inexistant files

// Node Modules
var fs = require('fs');
var _ = require('underscore');
var config = require('config.js');
var JSON = require('JSON');
var spawn = require('child_process').spawn;
var readMultipleFiles = require('read-multiple-files');
// Initialize mongo config
var	mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://' + config.mongo.host + '/' + config.mongo.database;

//readMultipleFiles([process.argv[2], process.argv[3]], 'utf8', function(err, data){
	//if (err) return console.error(err);
	var type = process.argv[2];
	var jsonData =process.argv[3];
	var IUSSWID = process.argv[4];
	var path = process.argv[5];
	var xenomeData = process.argv[6];
	var obj = {};
if (type=="dna") {
	obj['type'] = 'dna';

	if (typeof xenomeData !== 'undefined') {
		var xenomeExists = fs.existsSync(xenomeData);
		if (xenomeExists) {
			var xenomeLog = fs.readFileSync(xenomeData, 'utf8');
			var lines = xenomeLog.toString().split('\n');
			var match;
			for (var i = 0; i < lines.length; i++){
				if (/\t(.*)\tmouse?/.test(lines[i])) {
					match = /\t(.*)\tmouse?/.exec(lines[i]);
				}
			}
			obj['pct_mouse_content'] = parseFloat(match[1]).toFixed(2);
		} else {
			//console.log(xenomeFile + " does not exist");
			obj['pct_mouse_content'] = 'n/a';
		}
		obj['source'] = 'xenome';
	}else {
		obj['pct_mouse_content'] = 'n/a';
		obj['source'] = 'bam_qc';
	}
	if (typeof jsonData !== 'n/a') {
		var jsonExists = fs.existsSync(jsonData);
		if (jsonExists) {
			var jsonString = fs.readFileSync(jsonData, 'utf8'); 
			var lineObj = JSON.parse(jsonString);

			// Initialize
			var readsSP = parseFloat(lineObj['reads per start point']).toFixed(2);
			var onTargetRate = lineObj['reads on target']/lineObj['mapped reads'];

			// IUSSWID
			if (isNaN(parseInt(IUSSWID))) {
				obj['iusswid'] = IUSSWID;
			}
			else {
				obj['iusswid'] = parseInt(IUSSWID);
			};

			// Reads per start point
			obj['reads_sp'] = readsSP;

			// Map %, Raw Reads, Raw Yield
			var rawReads = (parseInt(lineObj['mapped reads']) + parseInt(lineObj['unmapped reads']) + parseInt(lineObj['qual fail reads']));

			if (rawReads > 0) {
				obj['map_pct'] = parseFloat(((lineObj['mapped reads']/rawReads)*100).toFixed(2));
				obj['reads'] = rawReads;
				obj['yield'] = parseInt(rawReads*lineObj['average read length']);
			} else {
				obj['map_pct'] = 0;
				obj['reads'] = 0;
				obj['yield'] = 0;
			}

			// % on Target
			obj['pct_on_target'] = parseFloat((onTargetRate*100).toFixed(2));

			// Insert mean, insert stdev, read length
			if (lineObj['number of ends'] === 'paired end') {
				obj['insert_mean'] = parseFloat(parseFloat(lineObj['insert mean']).toFixed(2));
				obj['insert_stdev'] = parseFloat(parseFloat(lineObj['insert stdev']).toFixed(2));
				obj['read_length_1'] = parseFloat(lineObj['read 1 average length']);
				obj['read_length_2'] = parseFloat(lineObj['read 2 average length']);
			} else {
				obj['insert_mean'] = 'n/a';
				obj['insert_stdev'] = 'n/a';
				obj['read_length_1'] = lineObj['read ? average length'];
				obj['read_length_2'] = 'n/a';
			}

			// Coverage
			var rawEstYield = lineObj['aligned bases'] * onTargetRate;
			var collapsedEstYield = rawEstYield/readsSP;

			obj['coverage_collapsed'] = parseFloat((collapsedEstYield/lineObj['target size']).toFixed(2));
			obj['coverage_raw'] = parseFloat((rawEstYield/lineObj['target size']).toFixed(2));
			getReadBreakdown(lineObj, IUSSWID, path, function (readFile) {
				//console.log ("returned from  read breakdown callback");
				obj['read_breakdown'] = readFile;

				getInsertDistribution(lineObj, IUSSWID, path, function (insertFile) {
					//console.log ("returned from insert dirstribution callback");
					obj['insert_distribution'] = insertFile;

					getSoftClip (lineObj, IUSSWID, path, function (softClipFile) {
						//console.log ("returned from soft clip callback");
						obj['soft_clip_by_cycle'] = softClipFile;

							var stream = fs.createWriteStream(path+"/qc-"+IUSSWID+".json");
							stream.once('open', function(fd) {
								stream.write(JSON.stringify(obj));
								stream.end();
							});

					});
				});
			});
		} else {
			console.log(jsonFile + " does not exist");

			if (isNaN(parseInt(IUSSWID))) {
				obj['iusswid'] = IUSSWID;
			}
			else {
				obj['iusswid'] = parseInt(IUSSWID);
			}
			// Reads per start point
			obj['reads_sp'] = 'n/a';
			obj['map_pct'] = 'n/a';
			obj['reads'] = 'n/a';
			obj['yield'] = 'n/a';
			obj['pct_on_target'] = 'n/a';
			obj['insert_mean'] = 'n/a';
			obj['insert_stdev'] = 'n/a';
			obj['read_length_1'] = 'n/a';
			obj['read_length_2'] = 'n/a';
			obj['coverage_collapsed'] = 'n/a';
			obj['coverage_raw'] = 'n/a';
			obj['read_breakdown'] = 'n/a';
			obj['insert_distribution'] = 'n/a';
			obj['soft_clip_by_cycle'] = 'n/a';
			var stream = fs.createWriteStream(path+"/qc-"+IUSSWID+".json");
			stream.once('open', function(fd) {
				stream.write(JSON.stringify(obj));
				stream.end();
			});
		}
	} else {
		if (isNaN(parseInt(IUSSWID))) {
			obj['iusswid'] = IUSSWID;
		}
		else {
			obj['iusswid'] = parseInt(IUSSWID);
		}
		// Reads per start point
		obj['reads_sp'] = 'n/a';
		obj['map_pct'] = 'n/a';
		obj['reads'] = 'n/a';
		obj['yield'] = 'n/a';
		obj['pct_on_target'] = 'n/a';
		obj['insert_mean'] = 'n/a';
		obj['insert_stdev'] = 'n/a';
		obj['read_length_1'] = 'n/a';
		obj['read_length_2'] = 'n/a';
		obj['coverage_collapsed'] = 'n/a';
		obj['coverage_raw'] = 'n/a';
		obj['read_breakdown'] = 'n/a';
		obj['insert_distribution'] = 'n/a';
		obj['soft_clip_by_cycle'] = 'n/a';
		var stream = fs.createWriteStream(path+"/qc-"+IUSSWID+".json");
		stream.once('open', function(fd) {
			stream.write(JSON.stringify(obj));
			stream.end();
		});
	}
} else {
		zipExists = fs.existsSync(jsonData);
	if (zipExists) {
		var zip = new AdmZip(jsonData);
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

		// IUSSWID
		if (isNaN(parseInt(IUSSWID))) {
			obj['iusswid'] = IUSSWID;
		}
		else {
			obj['iusswid'] = parseInt(IUSSWID);
		}

		// Read from zip files without extracting
		zipEntries.forEach(function(zipEntry) {
			// Data
			if (zipEntry.name === 'CollectRNASeqMetricsSummary.txt'){
				picard = zipEntry.getData().toString('utf8').split('\n');
				metrics = picard[1].split('\t');
			} else if (zipEntry.name === 'ReadsPerStartPoint.txt'){
				uniq = zipEntry.getData().toString('utf8').split('\n');
			} else if (zipEntry.name === 'rRNAcontaminationSummary.txt'){
				contam = zipEntry.getData().toString('utf8').split('\n');
			// Graphs (images to base64)
			} else if (zipEntry.name === 'pieChart.jpeg'){
				//console.log(zipEntry.getData().toString());
				obj['bases_breakdown'] = zipEntry.getData().toString('base64');
			} else if (/.*\.junctionSaturation_plot\.jpeg/.test(zipEntry.name)){
				obj['junction_saturation'] = zipEntry.getData().toString('base64');
			} else if (/.*\.geneBodyCoverage\.curves\.jpeg/.test(zipEntry.name) || /.*\.geneBodyCoverage\.jpeg/.test(zipEntry.name)){
				obj['rseqc_gene_body_coverage'] = zipEntry.getData().toString('base64');
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
		obj['reads'] = parseFloat(TOTAL_READS); // including unaligned
		obj['uniq_reads'] = parseFloat(UNIQ_READS);
		// Reads per start point
		if (START_POINTS != 0) {
			obj['reads_sp'] = parseFloat((UNIQ_READS/START_POINTS).toFixed(2));
		} else {
			obj['reads_sp'] = '#Start Points Job Failed -> rerun!'
		}
		obj['yield'] = parseFloat(PF_BASES); // Passed Filter Bases

		if (PCT_CORRECT_STRAND_READS !== 0) {
			obj['proportion_correct_strand_reads'] = parseFloat(PCT_CORRECT_STRAND_READS);
		} else {
			obj['proportion_correct_strand_reads'] = 'Not a Strand Specific Library';
		}
		obj['median_5prime_to_3prime_bias'] = parseFloat(MEDIAN_5PRIME_TO_3PRIME_BIAS);
		// rRNA Contamination (%reads aligned)
		if (TOTAL_READS !== 0) {
			obj['pct_rrna_content'] = parseFloat(((RIBOSOMAL_READS/TOTAL_READS)*100).toFixed(2));
		} else {
			obj['pct_rrna_content'] = 'Total Reads Job Failed -> re-run report';
		}
	} else {
		console.log(zipFile + " does not exist");

		// Add to object
		obj['bases_breakdown'] = 'n/a';
		obj['junction_saturation'] = 'n/a';
		obj['rseqc_gene_body_coverage'] = 'n/a';
		obj['reads'] = 'n/a';
		obj['uniq_reads'] = 'n/a';
		obj['reads_sp'] = 'n/a';
		obj['yield'] = 'n/a';
		obj['proportion_correct_strand_reads'] = 'n/a';
		obj['median_5prime_to_3prime_bias'] = 'n/a';
		obj['pct_rrna_content'] = 'n/a';
	}
	obj['type'] = 'rna';
	obj['source'] = 'rna_seq_qc';
	var stream = fs.createWriteStream(path+"/qc-"+IUSSWID+".json");
	stream.once('open', function(fd) {
		stream.write(JSON.stringify(obj));
		stream.end();
	});
}

/////////////////////GENERATING GRAPHS///////////////////////////

/** 
 * function for executing R code
 * returns a string with the base64 of the graph
 * @param {string} rString
 * @param {string} resultFile
 */
function useR(IUSSWID, type, path, callback){
	//console.log("in R function");
 	var RCall = ['--no-restore','--no-save',path+"/graphCode.png.Rcode"]
 	var image64;
    //var RCall = ['--no-restore','--no-save','/home/silioukhina/pieTest.png.Rcode']
    var R  = spawn('Rscript', RCall);

    R.on('exit',function(code){
        //console.log('got exit code: '+code)
        if(code!==0){
            console.log("graph "+type+IUSSWID+" was not made, exit code was: "+code);
            //console.log (fs.readFileSync("graphCode.png.Rcode").toString());
            return callback("n/a");
        }else{
            //console.log("graph made!");
            var image64 = fs.readFileSync(path+"/"+IUSSWID+type+".png").toString('base64');
            return callback(image64);
        }
    })
    //return callback(image64);
}
/** 
 * Making the R string to generate the Read Breakdown Chart
 * @param {JSON} lineObj
 * @param {string} IUSSWID
 */
function getReadBreakdown(lineObj, IUSSWID, path, callback){ 
	//console.log("in function");
	var graphExists = fs.existsSync(path+"/"+IUSSWID+"read_breakdown.png");
	if (graphExists) {
		var image = fs.readFileSync(path+"/"+IUSSWID+"read_breakdown.png").toString('base64');
		return callback(image);
	} else {
		var pieArray = [];
		var pieLabels = ["on target", "off target", "repeat/low quality", "unmapped"];
		var pieColours = ["forestgreen", "goldenrod", "darkslategray3", "goldenrod"];
		if (lineObj["barcode"]!== undefined) {
			var title = lineObj["run name"] + " Lane: " + lineObj["lane"] + " Barcode: " + lineObj["barcode"] + "\\n" + lineObj["library"]+"Read Breakdown";
		} else {
			var title = lineObj["run name"] + " Lane: " + lineObj["lane"] + "\\n" + lineObj["library"]+" Read Breakdown";
		}

		var readsTarget = parseInt(lineObj['reads on target']);
		//console.log("in side function: "+readsTarget);

		pieArray.push(readsTarget);

		pieArray.push(parseInt(lineObj['mapped reads'])-parseInt(lineObj['reads on target']));
		pieArray.push(parseInt(lineObj['qual fail reads']));
		pieArray.push(parseInt(lineObj['unmapped reads']));
		//console.log("making file");

		//var stream = fs.createWriteStream("graphs/"+IUSSWID+"_readPie.png.Rcode");
		var stream = fs.createWriteStream(path+"/graphCode.png.Rcode");
		stream.once('open', function(fd) {
			//console.log("in stream writer");

			var line1 = "slices <- c("+pieArray[0]+", "+pieArray[1]+", "+pieArray[2]+", "+pieArray[3]+")\n";
			var line2 = "lbls <- c(\""+pieLabels[0]+"\", \""+pieLabels[1]+"\", \""+pieLabels[2]+"\", \""+pieLabels[3]+"\")\n";
			var line3 = "cols <- c(\""+pieColours[0]+"\", \""+pieColours[1]+"\", \""+pieColours[2]+"\", \""+pieColours[3]+"\")\n";
			var line4 = "pct <- round(slices/sum(slices)*100)\n";
			var line5 = "lbls <- paste(lbls, pct)\n";
			var line6 = "lbls <- paste(lbls,\"%\",sep=\"\")\n";
			var line7 = "png(filename = \""+path+"/"+IUSSWID+"read_breakdown.png\", width = 640, height = 640)\n";
			var line8 = "pie(slices, labels = lbls, col=cols, main=\""+title+"\", border=NA)\n";
			var line9 = "dev.off()\n";
			var final = line1.concat(line2, line3, line4, line5, line6, line7, line8, line9);
			//console.log(final);
			stream.write(final);
			stream.end();

			//useR("graphs/"+IUSSWID+"_readPie.png.Rcode", "graphs/"+IUSSWID+"_readPie.png", function(image) {
			useR(IUSSWID, "read_breakdown", path, function(image) {
				//console.log("returning from R callback pie chart ");
				return callback(image);
			});
		});
	}	
}

/** 
 * Making the R string to generate the Insert Distribution Chart
 * @param {JSON} lineObj
 * @param {string} IUSSWID
 */
function getInsertDistribution(lineObj, IUSSWID, path, callback){
	var graphExists = fs.existsSync(path+"/"+IUSSWID+"insert_distribution.png");
	if (graphExists) {
		var image = fs.readFileSync(path+"/"+IUSSWID+"insert_distribution.png").toString('base64');
		return callback(image);
	} else {
		var lineX = [];
		var lineY = [];
		var colours =[];
		var insertMean = parseInt(lineObj['insert mean']);
		var insertStep = 50;
		var histogramObj = lineObj['insert histogram']
		for (var i in histogramObj)
		{
			if (i<650) {
				lineX.push(i);
				lineY.push(histogramObj[i]);
			}
		}
		for (var i = 0; i < lineX.length; i++) {
			if ((lineX[i] < (insertMean - (2 * insertStep))) || (lineX[i] > (insertMean + (2 * insertStep)))) {
				colours.push("firebrick");
			} else if ((lineX[i] < (insertMean - insertStep)) || (lineX[i] > (insertMean + insertStep))) {
				colours.push("goldenrod");
			} else {
				colours.push("forestgreen");
			}
		}
		if (lineObj["barcode"]!== undefined) {
			var title = lineObj["run name"] + " Lane: " + lineObj["lane"] + " Barcode: " + lineObj["barcode"] + "\\n" + lineObj["library"]+"Insert Distribution";
		} else {
			var title = lineObj["run name"] + " Lane: " + lineObj["lane"] + "\\n" + lineObj["library"]+" Insert Distribution";
		}

		//var stream = fs.createWriteStream("graphs/"+IUSSWID+"_insertLine.png.Rcode");
		var stream = fs.createWriteStream(path+"/graphCode.png.Rcode");
		stream.once('open', function(fd) {
			//console.log("in stream writer");

			var line1 = "xvals <- c("+lineX[0];
			for (i=1; i<lineX.length; i++) {
				line1 = line1.concat(", "+lineX[i]);
			}
			line1 = line1.concat(")\n");
			var line2 = "yvals <- c("+lineY[0];
			for (i=1; i<lineY.length; i++) {
				line2 = line2.concat(", "+lineY[i]);
			}
			line2 = line2.concat(")\n");
			var line3 = "cols <- c(\""+colours[0]+"\"";
			for (i=1; i<colours.length; i++) {
				line3 = line3.concat(", \""+colours[i]+"\"");
			}
			line3 = line3.concat(")\n");

			var line4 = "png(filename = \""+path+"/"+IUSSWID+"insert_distribution.png\", width = 640, height = 640)\n";
			var line5 = "plot(xvals, yvals, main=\""+title+"\", type=\"n\", col=\"black\", xlab=\"Insert Size (bp)\", ylab=\"Pairs\")\n";
			var line6 = "for(i in 1:(length(yvals)-1))\n{\n";
			var line7 = "polygon(c(xvals[i] - 0.5, xvals[i] - 0.5, xvals[i] + 0.5, xvals[i] + 0.5), c(0, yvals[i], yvals[i], 0), col=cols[i], border=NA)\n";
			var line8 = "}\n";
			var line9 = "dev.off()\n";
			var final = line1.concat(line2, line3, line4, line5, line6, line7, line8, line9);
			//console.log(final);
			stream.write(final);
			stream.end();

			useR(IUSSWID, "insert_distribution", path, function(image) {
				//console.log("returning from R callback insert line chart");
				return callback(image);
			});
		});
	}
}

/** 
 * Making the R string to generate the Soft Clip by Cycle Chart
 * @param {JSON} lineObj
 * @param {string} IUSSWID
 */
function getSoftClip(lineObj, IUSSWID, path, callback){
	var graphExists = fs.existsSync(path+"/"+IUSSWID+"soft_clips_by_cycle.png");
	if (graphExists) {
		var image = fs.readFileSync(path+"/"+IUSSWID+"soft_clips_by_cycle.png").toString('base64');
		return callback(image);
	} else {
		var lineX = [];
		var lineY = [];
		var colours =[];
		var readArray = ['read 1', 'read 2', 'read ?'];
		var alignedObj = {};
		var insertObj = {};
		var errorObj;
		var read1max = 0;
		for (var i = 0; i < readArray.length; i++) {
			alignedObj[readArray[i]] = {};
			insertObj[readArray[i]] = {};
			alignedObj[readArray[i]] = lineObj[readArray[i] + ' aligned by cycle'];
			insertObj[readArray[i]] = lineObj[readArray[i] + ' insertion by cycle'];
		}
		for (var i = 0; i < readArray.length; i++) {
			if (Object.keys(lineObj[readArray[i] + ' soft clip by cycle']).length > 0) {
				errorObj = lineObj[readArray[i] + ' soft clip by cycle'];
				for (var j in errorObj) {
					j = parseInt(j);
					if (lineObj['number of ends'] === 'single end'){
						lineX.push(j);
					} else {
						if (readArray[i] === 'read 1') {
							lineX.push(j);
							read1max++;
						} else if (readArray[i] === 'read 2') {
							lineX.push(j + read1max);
						}
					}
					if (alignedObj[readArray[i]][j] + insertObj[readArray[i]][j] + errorObj[j] > 0) {
						lineY.push((errorObj[j]/(alignedObj[readArray[i]][j] + errorObj[j] + insertObj[readArray[i]][j])) * 100);
					} else {
						lineY.push(0);
					}
					colours.push("firebrick");
				}
				if (readArray[i] === 'read 1') {
					lineX.push(read1max);
					lineY.push(0);
					colours.push("white");
					read1max++;
				}
			}
		}
		if (lineObj["barcode"]!== undefined) {
			var title = lineObj["run name"] + " Lane: " + lineObj["lane"] + " Barcode: " + lineObj["barcode"] + "\\n" + lineObj["library"]+"Soft Clips by Cycle";
		} else {
			var title = lineObj["run name"] + " Lane: " + lineObj["lane"] + "\\n" + lineObj["library"]+" Soft Clips by Cycle";
		}
			
		//var stream = fs.createWriteStream("graphs/"+IUSSWID+"_softClipLine.png.Rcode");
		var stream = fs.createWriteStream(path+"/graphCode.png.Rcode");
		stream.once('open', function(fd) {
			//console.log("in stream writer");

			var line1 = "xvals <- c("+lineX[0];
			for (i=1; i<lineX.length; i++) {
				line1 = line1.concat(", "+lineX[i]);
			}
			line1 = line1.concat(")\n");
			var line2 = "yvals <- c("+lineY[0];
			for (i=1; i<lineY.length; i++) {
				line2 = line2.concat(", "+lineY[i]);
			}
			line2 = line2.concat(")\n");
			var line3 = "cols <- c(\""+colours[0]+"\"";
			for (i=1; i<colours.length; i++) {
				line3 = line3.concat(", \""+colours[i]+"\"");
			}
			line3 = line3.concat(")\n");

			var line4 = "png(filename = \""+path+"/"+IUSSWID+"soft_clips_by_cycle.png\", width = 640, height = 640)\n";
			var line5 = "plot(xvals, yvals, main=\""+title+"\", type=\"n\", col=\"black\", xlab=\"Cycle\", ylab=\"% Bases Soft Clipped\", ylim=c(0, 100))\n";
			var line6 = "for(i in 1:(length(yvals)-1))\n{\n";
			var line7 = "polygon(c(xvals[i] - 0.5, xvals[i] - 0.5, xvals[i] + 0.5, xvals[i] + 0.5), c(0, yvals[i], yvals[i], 0), col=cols[i], border=NA)\n";
			var line8 = "}\n";
			var line9 = "dev.off()\n";
			var final = line1.concat(line2, line3, line4, line5, line6, line7, line8, line9);
			//console.log(final);
			stream.write(final);
			stream.end();

			useR(IUSSWID, "soft_clips_by_cycle", path, function(image) {
				//console.log("returning from R callback soft clip chart");
				return callback(image);
			});
		});
	}
}