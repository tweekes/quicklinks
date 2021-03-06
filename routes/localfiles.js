var express = require('express');
var http = require("http");
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var router = express.Router();

// See: http://stackoverflow.com/questions/7288814/download-a-file-from-nodejs-server-using-express
module.exports = function(config) {
  router.get('/download', function(req, res) {
      var file = path.normalize(req.query.fpath);

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

  //var imageFilePath = "..\\data\\images\\";
  //     "image_dir": "../quicklink-data/images"
  var imageFilePath = config.image_dir;
  var audioFilePath = config.audio_dir;
  router.post("/uploadimage",function(req,res){
      var dataObject = req.body;
      try {
          if (!fs.existsSync(imageFilePath)) {
              throw "Image path: " + imageFilePath + " is not setup.";
          }

          var extension = dataObject.dataUrl.match(/\/(.*)\;/)[ 1 ];
          var filePath = imageFilePath + "\\" + dataObject.fileName + "." + extension;
          if (fs.existsSync(filePath)) {
              throw "File already exists";
          }

          var dataString = dataObject.dataUrl.split( "," )[ 1 ];
          var buffer = new Buffer( dataString, 'base64');
          fs.writeFileSync( filePath, buffer, "binary" );

          res.status(200);
          res.send(dataObject.fileName + "." + extension);
      } catch(err) {
          res.status(404);
          res.send(err);
      }
  });
  // See: THREE AMAZING USES FOR DATAURLS  - http://wolframhempel.com/2012/12/06/three-amazing-uses-for-dataurls/
  // <img src=”data:image/png;base64,iVBOR…” />
  var saveDataUrl = function( fileName, dataUrl )
  {
      var dataString = dataUrl.split( "," )[ 1 ];
      var buffer = new Buffer( dataString, 'base64');
      var extension = dataUrl.match(/\/(.*)\;/)[ 1 ];
      var fullFileName = fileName + "." + extension;
      return fs.writeFileSync( fullFileName, buffer, "binary" );
  };

  router.get("/image/*",function(req,res){
    getLocalContent(req,res,'image',imageFilePath)
  });

  router.get("/audio/*",function(req,res){
    getLocalContent(req,res,'audio',audioFilePath)
  });

  function getLocalContent(req,res,contentType,localFilePath) {
    var re = new RegExp('\/'+ contentType + '\/(.*)');
    var fileName = req.url.match(re)[1];
    var fileName = fileName.replace(/%20/g," ");
    var filePath = localFilePath + "\\" + fileName;
    var mimeType = mime.lookup(fileName);

    try {
        if (!fs.existsSync(filePath)) {
            throw "ERROR: File: " + filePath + " does not exist";
        }
        var rs = fs.createReadStream(filePath);
        rs.on('error',reportError);
        res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
        res.writeHead(200, {'Content-Type': mimeType});
        rs.pipe(res);
    } catch(err) {
        res.status(404);
        res.send(err);
    }
  }


  router.delete("/deleteimage/:name",function(req,res){
      var targetFilePath = imageFilePath + "\\"+ req.params.name.replace(/%20/g," ");
      fs.unlink(targetFilePath, function (err) {
          if (err) {
              res.status(417);  // 417 Expectation Failed
              res.send(err);
          } else {
              res.status(200);
              res.send("ok");
          }
      });
  });
  return router;
}

var reportError = function(err) {
    res.writeHead(500);
    res.end('Internal Server Error');
};
