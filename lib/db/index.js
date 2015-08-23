'use strict';

// dependencies.
var mongoose = require('mongoose');
var winston = require('winston');

// load settings
var settings = require('../settings');

/**
 * Connects to the database.
 */
var connect = function () {

  var options = {
    server: {
      socketOptions: {
        keepAlive: 1
      }
    }
  };

  mongoose.connect(settings.database, options, function(err){
    if(err){
      winston.log('error', 'Could not connect to database at', settings.database);
      winston.log('error', 'Fatal error encountered, exiting. ');
      process.exit(1);
    } else {
      winston.log('info', 'Connected to database at', settings.database);
    }
  });
};

// register error handlers.
mongoose.connection.on('error', function(e){
  winston.log('error', e);
});
mongoose.connection.on('disconnected', connect);

// try to connection
connect();

module.exports.awaitConnection = function(next){
  if(mongoose.connection.readyState === 1){
    next(null);
  } else {
    mongoose.connection.once('open', next);
  }
};
