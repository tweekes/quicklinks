var express = require('express');
var http = require("http");
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var router = express.Router();

// See: http://stackoverflow.com/questions/7288814/download-a-file-from-nodejs-server-using-express

// http://localhost:3000/local/download?fpath=C:\Users\Tommy\WebstormProjects\quicklinks\public\test3.xls
router.get('/download', function(req, res) {
    var file = path.normalize(req.query.fpath);
    function reportError(err) {
        console.log(err);
        res.writeHead(500);
        res.end('Internal Server Error');
    }
    fs.exists(file,function(exists) {
       if (exists) {
           fs.stat(file,function(err,stat){
               if (err) {
                   return reportError(err);
               }
               if (stat.isDirectory()) {
                   res.writeHead(403); res.end('Forbidden - is a directory.');
               } else {
                   // returns { root : "/", dir : "/home/user/dir", base : "file.txt",  ext : ".txt", name : "file" }
                   var fp = path.parse(file);
                   var mimeType = mime.lookup(fp.base);
                   console.log("Path: " + file + " Filename " + fp.base);
                   var rs = fs.createReadStream(file);
                   rs.on('error',reportError);
                   res.setHeader('Content-disposition', 'attachment; filename=' + fp.base);
                   res.writeHead(200, {'Content-Type': mimeType});
                   rs.pipe(res);
               }
           });
       } else{
           res.writeHead(404);
           res.end('Not found');
       }
    });
});

module.exports = router;