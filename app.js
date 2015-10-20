var express = require('express'); var app = express();
var logger = require('morgan'); app.use(logger('dev'));
var path = require('path');
var bodyParser = require('body-parser');
var config = require('./config.json')[app.get('env')];
var model = require('./routes/model')(config);
var localfiles = require('./routes/localfiles')(config);
var version = require('./routes/version')(config);
var urls = require('./routes/urls')(config);

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
if (app.get('env') === 'development') {
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

console.log("Starting... datafile: " + config.data_file);
module.exports = app;
