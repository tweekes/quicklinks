var express = require('express');
var http = require('http');
var us = require('underscore');

var router = express.Router();
var logger;


// http://localhost:3000/urls/validate?path=http://www.rte.ie/news/2015/0930/731284-syria/
module.exports = function(config) {
  router.get('/validate', function(req, res, next) {
      var paramPath = req.query.path;
      var paramPath = paramPath.replace(/ /g,"%20");
      var paramHost = extractDomain(paramPath);
      logger = require('../mgmt/logger')(config);

      logger.debug("paramPath: " + paramPath);
      logger.debug("paramHost: " + paramHost);

      // If host is internal then a proxy is not required.
      var options;
      if (isIntranetHost(config.internal_domains,paramHost)) {
        options = {
          path: paramPath,
          headers: {
            Host: paramHost
          }
        };
      }  else {
        options = {
          path: paramPath,
          host: "127.0.0.1",
          port: 3128,
          headers: {
            Host: paramHost
          }
        };
      }

      logger.debug("options: " + JSON.stringify(options));

      http.get(options, function (r) {
          // console.log("Got response: " + r.statusCode);
          res.status(200);
          res.send({"path":paramPath,"host":paramHost,"status":r.statusCode});
      }).on('error', function (err) {
          logger.info("Error:" + err);
          res.status(404); // NOt found!
          res.send({"path":paramPath,"host":paramHost,"status":404,message:err.message,errno:err.errno, code: err.code});
      });
  });

  router.get('/validatec', function(req, res, next) {
      var paramPath = req.query.path;
      var paramPath = paramPath.replace(/ /g,"%20");
      var paramHost = extractDomain(paramPath);

      // If host is internal then a proxy is not required.
      var options;
        options = {
          path: paramPath,
          host: "127.0.0.1",
          port: 3128,
          headers: {
            Host: paramHost
          }
        };

      http.get(options, function (r) {
          // console.log("Got response: " + r.statusCode);
          res.status(200);
          res.send({"path":paramPath,"host":paramHost,"status":r.statusCode});
      }).on('error', function (err) {
          console.log("Error:" + err);
          res.status(404); // NOt found!
          res.send({"path":paramPath,"host":paramHost,"status":404,message:err.message,errno:err.errno, code: err.code});
      });
  });

  router.get('/validateb', function(req, res, next) {
      var paramPath = req.query.path;
      var paramPath = paramPath.replace(/ /g,"%20");
      var paramHost = extractDomain(paramPath);

      http.get(paramPath, function (r) {
          // console.log("Got response: " + r.statusCode);
          res.status(200);
          res.send({"path":paramPath,"host":paramHost,"status":r.statusCode});
      }).on('error', function (err) {
          console.log("Error:" + err);
          res.status(404); // NOt found!
          res.send({"path":paramPath,"host":paramHost,"status":404,message:err.message,errno:err.errno, code: err.code});
      });
  });

  return router;
}

function extractDomain(url) {
    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];
    return domain;
}

function isIntranetHost(intranetHostlist,host) {
  var found = us.contains(intranetHostlist,host);
  return found;
}
