var express = require('express');
var http = require("http");
var router = express.Router();

router.get('/validate', function(req, res, next) {
    var urlText = req.query.urltext;
    console.log("urltext " + urlText );

    var hostName = "Xjimmurraymusic.com";  // http://www.jimmurraymusic.com/ddd-tuning/introduction.html
    var pathStr = "http://www.jimmurraymusic.com/ddd-tuning/introduction.htmlX";
    var options = {method: 'HEAD', host: hostName, port: 80, path: pathStr};
    var outBoundReq = http.request(options, function(r) {
            console.log(JSON.stringify(r.headers));
            res.status(200);
            res.send("ok");
        });

    outBoundReq.on('error', function(err) {
        handlerError('problem with request: ' + err.message,err,res)
    });
    outBoundReq.end();
});

var handlerError = function(eMsg,err,res) {
    console.log(eMsg + '\n' + err);
    res.status(400);
    res.send({'error':{message:eMsg}});
};

module.exports = router;
