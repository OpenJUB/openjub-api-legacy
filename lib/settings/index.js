var winston = require('winston');

try {
  module.exports = require('../../settings');
} catch(e){
  winston.log('error', 'Unable to load configuration file. ');
  winston.log('error', 'Make sure settings.json exists and try again. '); 
  process.exit(1);
}
