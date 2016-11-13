var express = require('express'); var app = express();
var env = app.get('env');
var mlogger = require('morgan'); app.use(mlogger('dev'));
var path = require('path');
var bodyParser = require('body-parser');
var config = require('./config.json')[env];
var db = require('./mgmt/db')(config);
var model = require('./routes/model')(config,db);
var localfiles = require('./routes/localfiles')(config);
var version = require('./routes/version')(config);
var urls = require('./routes/urls')(config);
var logger = require('./mgmt/logger')(config);
var backupmgr = require('./mgmt/backupsnapshots.js')(config,db);
backupmgr.run();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: false })); // was { extended: true }

app.use(express.static(path.join(__dirname, 'public')));
app.use('/version', version);
app.use('/model', model);
app.use('/local', localfiles);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// development error handler, will print stacktrace
if (env === 'development' || env === 'test') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
// production error handler, no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

logger.info("Starting... env: " + env + " datafile: " + config.data_file);
module.exports = app;
