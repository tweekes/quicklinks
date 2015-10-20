

var express = require('express');
var router = express.Router();

module.exports = function(config) {
    router.get('/', function(req, res) {
        res.status(200);
        res.send(config);
    });
    return router
}