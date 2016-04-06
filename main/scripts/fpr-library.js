// Script takes in fpr-Library.json output from perl fpr-json.pl
// Functions are based off of fpr-Library.json and update library data to mongodb

var fs = require('fs');
var	mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://10.30.128.97:27017/seqwareBrowser';
var functions = require('/u/mcheng/browsertest/fpr.js');
//var functions = require('/home/mcheng/Documents/workspace/seqware-browser/main/fpr.js')

functions.updateLaneDetailsTotalsByRun();

