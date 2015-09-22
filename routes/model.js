var express = require('express');
var router = express.Router();

// var config = require('../config.json')[app.get('env')];
// console.log("model ... datafile: " + config.data_file);

// See, https://github.com/louischatriot/nedb#creatingloading-a-database
var Datastore = require('nedb');

// You can issue commands right away
// See: http://stackoverflow.com/questions/13151693/passing-arguments-to-require-when-loading-module
module.exports = function(config) {
    var db = new Datastore({ filename: config.data_file, autoload: true });

    /* GET users listing. */
    router.get('/init', function (req, res, next) {
        var docs = [
            {
                dtype: "ref-section",
                key: 'topAdmin',
                title: 'Top Admin',
                comment: 'This is top level general purpose menu.',
                jumpItems: [
                    {title: 'Breeze', link: 'http://www.google.com', note: ''},
                    {title: 'TMS', link: 'http://www.google.com', note: ''},
                    {title: 'Webtime', link: 'http://www.google.com', note: ''}
                ],
                linkItems: []
            },
            {
                dtype: "ref-section",
                key: 'topArchitecture',
                title: 'Top Architecture',
                comment: 'This is the top, non project specific, application architecture menu.',
                jumpItems: [
                    {title: 'Wiki D & Arch', link: '"http://www.google.com', note: ''},
                    {title: 'Arch Lib', link: 'http://www.google.com', note: ''},
                    {title: 'TDGRB', link: 'http://www.google.com', note: ''}
                ],
                linkItems: []
            },
            {
                dtype: "ref-section",
                key: 'consoles',
                title: 'Developer Consoles',
                comment: 'Menu for development consoles like, weblogic, websphere, etc',
                jumpItems: [
                    {title: 'Weblogic (Dev)', link: 'http://www.google.com', note: ''},
                    {title: 'Websphere(Dev)', link: 'http://www.google.com', note: ''},
                    {title: 'Websphere(Qar)', link: 'http://www.google.com', note: ''}
                ],
                linkItems: []
            },
            {
                dtype: "ref-section",
                key: 'partnerSites',
                title: 'Partner Sites',
                comment: 'Menu to hold partner sites.',
                jumpItems: [
                    {title: 'Celent', link: 'http://www.google.com'},
                ],
                linkItems: []
            },
            {
                dtype: "ref-section",
                key: 'topGoals',
                title: 'Top Goals',
                comment: 'A section containing the top goals.',
                jumpItems: [],
                linkItems: [
                    {title: 'Keep Jira up to date.', link: '', note: ''},
                    {title: 'Keep up to date on Google', link: 'http://www.google.com/', note: ''},
                    {title: 'A goal with note only', link: '', note: 'This is a note'},
                    {
                        title: 'A goal with note and a link',
                        link: 'http://www.google.com/',
                        note: 'This is the note to go with the link.'
                    }
                ]
            }
        ];

        db.remove({dtype: "ref-section"}, {multi: true}, function (err, numRemoved) {
            if (!err) {
                console.log("Deleting ... " + numRemoved + " documents have been removed before updating.")
                db.insert(docs, function (err, newDoc) {   // Callback is optional
                    if (err) {
                        console.log("error! success = " + success);
                        success = false;
                        var eMsg = "Failed to Insert: " + d.key;
                        handlerError(eMsg, err, res);
                    } else {
                        res.status(200);
                        res.send("ok");
                    }
                    // newDoc is the newly inserted document, including its _id
                    // newDoc has no key called notToBeSaved since its value was undefined
                });
            }
        });

    });

// Post - add record
    router.post('/qlinks', function (req, res) {
        var doc = req.body;
        db.insert(doc, function (err, newDoc) {   // Callback is optional
            if (err) {
                var eMsg = "Failed to Insert: " + doc.key;
                handlerError(eMsg, err, res);
            } else {
                res.status(200);
                res.send("ok");
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
                res.send("ok");
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

