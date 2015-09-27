var express = require('express');
var router = express.Router();

// See: http://stackoverflow.com/questions/7288814/download-a-file-from-nodejs-server-using-express

module.exports = function(config) {
    router.get('/', function(req, res) {
        res.status(200);
        res.send(config);
    });
    return router
}