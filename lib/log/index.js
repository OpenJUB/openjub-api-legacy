'use strict'; 

var winston = require('winston'); 
var morgan = require('morgan'); 

// enable colors
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
  'colorize': true, 
  'timestamp': true
});


var morganLogger = morgan(
  ':method :url :status :response-time ms - :res[content-length]', 
  {
    'stream': {
      'write': function(msg, enc){
        winston.log('info', msg.replace(/\n$/, ''));
      }
    }
  }
); 


// thats it
module.exports = morganLogger;