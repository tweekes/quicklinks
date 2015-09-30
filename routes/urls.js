var express = require('express');
var http = require("http");
var router = express.Router();

// http://localhost:3000/urls/validate?path=http://www.rte.ie/news/2015/0930/731284-syria/
router.get('/validate', function(req, res, next) {
    var paramPath = req.query.path;
    http.get(paramPath, function (r) {
        console.log("Got response: " + r.statusCode);
        res.status(200);
        res.send({"path":paramPath,"status":r.statusCode});
    }).on('error', function (err) {
        res.status(404); // NOt found!
        res.send({"path":paramPath,"status":404,message:err.message,errno:err.errno, code: err.code});
    });
});


module.exports = router;
