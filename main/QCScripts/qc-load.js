// arguments: transformedJsonFile
var config = require('config.js');

// Initialize mongo config
var url = 'mongodb://' + config.mongo.host + '/'+ config.mongo.database;
var functions = require("./loadFunctions.js")

functions.insertJSON(process.argv[2],url, function() {});
