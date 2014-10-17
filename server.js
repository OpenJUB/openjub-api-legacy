'use strict';

// Module dependencies.
var express = require('express');
var app = express();
var colors = require('colors');
try{
  var settings = require('./settings');
} catch(e){
  console.log('ERR'.red + ' Error parsing settings. Make sure settings.json exists. ');
  process.exit(1);
}

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
