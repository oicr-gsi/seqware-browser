var	mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
//var mongoose = require('mongoose');
var JSON = require('JSON');
var fs = require('fs');
var spawn = require('child_process').spawn;

var assert = require('chai').assert;
var expect = require("chai").expect;

var test = require('unit.js');
var extractqc = require("../main/QCScripts/extractFunctions");
var transformqc = require("../main/QCScripts/transformFunctions");
var loadqc = require("../main/QCScripts/loadFunctions");
var randomNum = parseInt(Math.random()*100000);
var input = process.env.npm_config_mongo_db_for_testing;
var mongourl = 'mongodb://' + input + '/test_'+ randomNum;

describe('qc loading scripts', function() {
	//connects to MongoDB, empties QC collection in this testing Directory
	before ('mongo address received, empty QC collection', function(done) {
		if(input==undefined) {
			test.fail('mongo address was not entered correctly: npm --mongo_db_for_testing=_______ test');
		}
		MongoClient.connect(mongourl, function(err, db) {
			if(db==null) {
				test.fail('incorrect address entered');
			}
			db.collection('QC').drop();
			done();
		});
	});
	after ('drop database', function(done) {
		if(input==undefined) {
			test.fail('mongo address was not entered correctly: npm --mongo_db_for_testing=_______ test');
		}
		MongoClient.connect(mongourl, function(err, db) {
			if(db==null) {
				test.fail('incorrect address entered');
			}
			db.dropDatabase();
			done();
		});
	});
	describe('extract:', function() {
		//check databese connection
		it('connects to mongodb', function(done) {
			MongoClient.connect(mongourl, function(err, db) {
				expect(err).to.equal(null);
				done();
			});
		});
		//function does not return any ids for an empty collection
		it('findReportDocumentsIUSSWID: identifies collection as empty', function(done) {
			MongoClient.connect(mongourl, function(err, db) {
				db.collection('QC').remove({});
				var docs = [];
				extractqc.findReportDocumentsIUSSWID(docs, 'QC', db, function (err) {
					test.assert(docs[0]==undefined);
					done();
				});
			});
		});
			it('findReportDocumentsIUSSWID: identifies collection to have pre existing data', function(done) {
			MongoClient.connect(mongourl, function(err, db) {
				var insertArray = [];
				var testArray = [];
				for (i=0; i<5;i++) {
					insertArray[i]={};
					insertArray[i]['type']="dna";
					insertArray[i]['iusswid'] = i;
					testArray[i]=i.toString();
				}
				db.collection('QC').insert(insertArray, function() {
					var docs = [];
					extractqc.findReportDocumentsIUSSWID(docs, 'QC', db, function (err) {
						expect(docs.length).to.equal(5);
						expect(docs).to.deep.equal(testArray);
						done();
					});
				});
			});
		});
		//will not generate empty json when no path given
		it('makeFile: no arguments provided, throw error', function(done) {
			MongoClient.connect(mongourl, function(err, db) {
				test.assert(extractqc.makeFile(undefined, db)==null);
				done();
			});
		});
		//fs is working
		it('readfile retrieves from json', function(done) {
			var list = fs.readFileSync("./test/smallLibrary.json", 'utf8');
			test.string(list).isNotEmpty();
			done();
		});
		//function correctly reads list
		it('makeFile: string, contains xenome and rna files', function(done) {
			MongoClient.connect(mongourl, function(err, db) {
				var jsonString = fs.readFileSync("./test/smallLibrary.json", 'utf8');  
				extractqc.makeFile(jsonString, db, function(list) {
					test.string(list)
						.contains('dna')
						.contains('rna')
						.contains('Xenome');
					done();
				});
			});
		});
	});
	describe('transform:', function() {
		//makes an R script, the function can then take this script and make an png file
		it('transform R script to image', function(done) {
			var stream = fs.createWriteStream("./test/tmp/graphCode.png.Rcode");
			stream.once('open', function(fd) {
				line1="xvals <- c(1,2,3,4,5)\nyvals <- c(0,0,0,0.018276523805172255,0.018276523805172255)\n"
				line12="cols <- c(\"firebrick\", \"firebrick\", \"firebrick\", \"firebrick\", \"firebrick\")\n";
				line2="png(filename = \"./test/tmp/8999soft_clips_by_cycle.png\", width = 640, height = 640)\n";
				line3="plot(xvals, yvals, main=\"title\", type=\"n\", col=\"black\", xlab=\"Cycle\", ylab=\"% Bases Soft Clipped\", ylim=c(0, 100))\n";
				line4="for(i in 1:(length(yvals)-1))\n{\n";
				line5="polygon(c(xvals[i] - 0.5, xvals[i] - 0.5, xvals[i] + 0.5, xvals[i] + 0.5), c(0, yvals[i], yvals[i], 0), col=cols[i], border=NA)\n";
				line6="}\ndev.off()\n";
				var final = line1.concat(line12, line2, line3, line4, line5, line6);
				stream.write(final);
				stream.end();
				transformqc.useR("8999", "soft_clips_by_cycle", "./test/tmp", function(image) {
					expect(image).to.not.equal(null);
					expect(image).to.not.equal("n/a");
					var imageFile = fs.readFileSync("./test/tmp/8999soft_clips_by_cycle.png", 'utf8');
					expect(imageFile).to.not.equal(undefined);
					done()
				});
			});
		});
		//no png file created with incomplete R script data
		it('no image when incomplete R script', function(done) {
			var stream = fs.createWriteStream("./test/tmp/graphCode.png.Rcode");
			stream.once('open', function(fd) {
				line1="xvals <- c(undefined)\nyvals <- c(undefined)\nyvals <- c(undefined)\ncols <- c(\"undefined\")\n";
				line2="png(filename = \"./8998soft_clips_by_cycle.png\", width = 640, height = 640)\n";
				line3="plot(xvals, yvals, main=\"title\", type=\"n\", col=\"black\", xlab=\"Cycle\", ylab=\"% Bases Soft Clipped\", ylim=c(0, 100))\n";
				line4="for(i in 1:(length(yvals)-1))\n{\n";
				line5="polygon(c(xvals[i] - 0.5, xvals[i] - 0.5, xvals[i] + 0.5, xvals[i] + 0.5), c(0, yvals[i], yvals[i], 0), col=cols[i], border=NA)\n";
				line6="}\ndev.off()\n";
				var final = line1.concat(line2, line3, line4, line5, line6);
				stream.write(final);
				stream.end();
				transformqc.useR(8998, "insert_distribution", "./test/tmp", function(image) {
					expect(image).to.not.equal(null);
					expect(image).to.equal("n/a");
					done();
				});
			});
		});
		//can generate the R script file
		it('transform json to Rscript', function(done) {
			var jsonString = fs.readFileSync("./test/NA12877_art_30x_WG_BWAMEM_simulated.json", 'utf8'); 
			var obj = JSON.parse(jsonString);
			transformqc.getReadBreakdown(obj, 906719, "./test/tmp", function(image) {
				expect(image).to.not.equal(null);
				expect(image).to.not.equal("n/a");
				done();
			});
		});
		//makes empty properties when not given path
		it('no path, input is n/a', function(done) {
			transformqc.makeObject("./test/tmp", "dna", "n/a", "906719", undefined, function(obj, path, IUSSWID) {
				test.object(obj)
					.hasProperty('iusswid', parseInt(IUSSWID))
					.hasProperty('type', "dna")
					.hasProperty('reads', "n/a")
					.hasProperty('pct_mouse_content', "n/a")
					.hasLength(18);
				done();
			});
		});
		it('rna file does not exist', function(done) {
			transformqc.makeObject("./test/tmp", "rna", "./rnaqc.report.zip", "906719", undefined, function(obj, path, IUSSWID) {
				test.object(obj)
					.hasProperty('iusswid', parseInt(IUSSWID))
					.hasProperty('type', "rna")
					.hasProperty('reads', "n/a")
					.hasLength(13);
				done();
			});
		});
		it('dna file does not exist', function(done) {
			transformqc.makeObject("./test/tmp", "dna", "./dna.BamQC.json", "906719", undefined, function(obj, path, IUSSWID) {
				test.object(obj)
					.hasProperty('iusswid', parseInt(IUSSWID))
					.hasProperty('read_breakdown', "n/a")
					.hasProperty('pct_mouse_content', "n/a")
					.hasLength(18);
				done();
			});
		});
		it('full dna without xenome file', function(done) {
			transformqc.makeObject("./test/tmp", "dna", "./test/NA12877_art_30x_WG_BWAMEM_simulated.json", "906719", undefined, function(obj, path, IUSSWID) {
				test.object(obj)
					.hasProperty('iusswid', parseInt(IUSSWID))
					.hasNotProperty('reads', "n/a")
					.hasProperty('read_breakdown')
					.hasProperty('soft_clip_by_cycle')
					.hasNotProperty('soft_clip_by_cycle', "n/a")
					.hasProperty('pct_mouse_content', "n/a")
					.hasLength(18);
				done();
			});
		});
		it('full dna with xenome file', function(done) {
			transformqc.makeObject("./test/tmp", "dna", "./test/NA12877_art_30x_WG_BWAMEM_simulated.json", "906719", "./test/partial_xenome.log", function(obj, path, IUSSWID) {
				test.object(obj)
					.hasProperty('iusswid', parseInt(IUSSWID))
					.hasNotProperty('reads', "n/a")
					.hasProperty('read_breakdown')
					.hasProperty('source', "xenome")
					.hasNotProperty('pct_mouse_content', "n/a")
					.hasLength(18);
				done();
			});
		});
	/*	it('full rna file', function(done) {
			transformqc.makeObject("./test/tmp", "rna", "./test/rnaqc.report.zip", "54321", undefined, function(obj, path, IUSSWID) {
				test.object(obj)
					.hasProperty('iusswid', parseInt(IUSSWID))
					.hasNotProperty('reads', "n/a")
					.hasProperty('bases_breakdown')
					.hasProperty('source', "rna_seq_qc")
					.hasNotProperty('pct_mouse_content')
					.hasLength(13);
				done();
			});
		});*/
	});
	describe('load:', function() {
		it('loads one object into collection', function(done) {
			MongoClient.connect(mongourl, function(err, db) {
				db.collection('QC').count({}, function(error, count) {
					loadqc.insertJSON("./test/qc-878379.json",mongourl, function() {
						db.collection('QC').count({}, function(error, newcount) {
							expect(newcount).to.equal(count+1);
							done();
						});
					});
				});
			});
		});
		//load the same id twice, make sure it only appears once
		it('iusswid already exists', function(done) {
			MongoClient.connect(mongourl, function(err, db) {
				var data = fs.readFileSync("./test/qc-906719.json", 'utf8');
				runData = JSON.parse(data);
				db.collection('QC').insert(runData);
				db.collection('QC').count({}, function(error, count) {
					loadqc.insertJSON("./test/qc-906719.json",mongourl, function() {
						db.collection('QC').count({}, function(error, newcount) {
							expect(newcount).to.equal(count);
							done();
						});
					});
				});
			});
		});
	});
});