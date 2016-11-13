
// See, https://github.com/louischatriot/nedb#creatingloading-a-database
var Datastore = require('nedb');

var log;

module.exports = function(config) {
    log = require('../mgmt/logger')(config);
    var db = new Datastore({filename: config.data_file, autoload: true});
    log.debug("database created!");
    return db;
}