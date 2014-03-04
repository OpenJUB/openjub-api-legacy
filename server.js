'use strict';

// Module dependencies.
var express = require('express');
var app = express();
var colors = require('colors');
var settings = require('./settings');

// Express Configuration
require('./lib/config/express')(app);

// API Routes
require('./lib/routes')(app);

var logo = settings.logo.join('\n');
console.log(logo.cyan);

// Start server
var port = process.env.PORT || settings.port;
app.listen(port, function () {
  console.log('INFO'.cyan + ' Express server listening on port %d in %s mode', port, app.get('env'));
});

// Expose app
exports = module.exports = app;
