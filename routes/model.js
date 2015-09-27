var express = require('express');
var router = express.Router();

// var config = require('../config.json')[app.get('env')];
// console.log("model ... datafile: " + config.data_file);

// See, https://github.com/louischatriot/nedb#creatingloading-a-database
var Datastore = require('nedb');

// You can issue commands right away
// See: http://stackoverflow.com/questions/13151693/passing-arguments-to-require-when-loading-module
// also: http://openmymind.net/2012/2/3/Node-Require-and-Exports/
module.exports = function(config) {
    var db = new Datastore({ filename: config.data_file, autoload: true });

// Post - add record
    router.post('/qlinks', function (req, res) {
        var doc = req.body;
        db.insert(doc, function (err, newDoc) {   // Callback is optional
            if (err) {
                var eMsg = "Failed to Insert: " + doc.key;
                handlerError(eMsg, err, res);
            } else {
                res.status(200);
                res.send(doc);
            }
        });
    });

// Post - update an existing record.
    router.post('/qlinks/:id', function (req, res) {
        // console.log("router.post('/qlinks/:id' called!");
        var doc = req.body;
        var idDoc = {};
        idDoc._id = req.params.id;
        db.update(idDoc, doc, {}, function (err, numReplaced) {
            if (err) {
                var eMsg = "Failed to update: " + doc.key;
                handlerError(eMsg, err, res);
            } else {
                res.status(200);
                res.send(doc);
            }
        });

    });

    router.delete('/qlinks/:id', function (req, res) {
        var idDoc = {};
        idDoc._id = req.params.id;
        db.remove(idDoc, {multi: false}, function (err, numRemoved) {
            if (err) {
                var eMsg = "Failed to delete for _id: " + idDoc._id;
                handlerError(eMsg, err, res);
            } else {
                res.status(200);
                res.send("ok");
            }
        });
    });


    router.get('/qlinks', function (req, res, next) {
        // var searchTitle = req.params('title');
        var selectText = req.query.select;
        console.log("select = " + selectText);
        select = JSON.parse(selectText);
        db.find(select, function (err, docs) {
            if (err) {
                var eMsg = "Failed to find: " + selectText;
                handlerError(eMsg, err, res);
            } else {
                res.send(docs);  // JSON.stringify(docs)
            }
        });
    });

    return router;
};

var handlerError = function(eMsg,err,res) {
    console.log(eMsg + '\n' + err);
    res.status(400);
    res.send({'error':{message:eMsg}});
};
