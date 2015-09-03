var winston = require('winston'); 

var ldap = require('../../db/ldap');
var settings = require('../../settings');
var inquirer = require('inquirer');

module.exports = function(commander, next){
  
  // load username && password from config file.
  var username = settings.ldap.username || null;
  var password = settings.ldap.password || null;

  // load from command line if available
  if(commander.username && commander.password){
    username = commander.username;
    password = commander.password;
  }

  // if we have a username + Password
  // we are ready already
  if(username && password){
    
    ldap.bind('', username, password, function(err, client){
      if(err){
        winston.log('error', 'Could not connect to database at', ldap.url);
        winston.log('error', 'Fatal error encountered, exiting. ');
        process.exit(1);
      } else {
        winston.log('info', 'Connected to database at '+ldap.url);
        next(null, [username, password])
        return;
      }
    });
    
    return;
  }

  // else query for it
  inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'CampusNet username',
      validate: function (value) {
        var pass = value.length !== 0;
        if (pass) {
          return true;
        } else {
          return 'Please Enter a Username'
        }
      }
    },
    {
      type: 'password',
      name: 'password',
      message: 'CampusNet password',
      validate: function (value) {
        var pass = value.length !== 0;
        if (pass) {
          return true;
        } else {
          return 'Please Enter a Password'
        }
      }
    }
  ], function (answers) {
    ldap.bind('', answers.username, answers.password, function(err, client){
      if(err){
        winston.log('error', 'Could not connect to database at', ldap.url);
        winston.log('error', 'Fatal error encountered, exiting. ');
        process.exit(1);
      } else {
        winston.log('info', 'Connected to database at '+ldap.url);
        next(null, [answers.username, answers.password])
        return;
      }
    });
  });
};