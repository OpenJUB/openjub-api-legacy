var mongoose = require('mongoose');
var winston = require('winston');

var settings = require('../settings');

var connect = function () {

  var options = { server: { socketOptions: { keepAlive: 1 } } };

  mongoose.connect(settings.database, options, function(err){
    if(err){
      winston.log("error", "Could not connect to database at", settings.database);
      winston.log("error", "Fatal error encountered, exiting. ");
      process.exit(1);
    } else {
      winston.log("info", "Connected to database at", settings.database);
    }
  });

};

mongoose.connection.on('error', function(e){
  winston.log('error', e);
});

mongoose.connection.on('disconnected', connect);

connect();
