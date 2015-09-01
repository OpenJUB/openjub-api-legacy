// imports
var mongoose = require('mongoose');
var commander = require('commander');
var prompt = require('prompt');
var inquirer = require('inquirer');
var winston = require('winston');

// load the basics
var log = require('../log');
var db = require('../db');
var ldap = require('../db/ldap');
var settings = require('../settings');

// get the backend
var backend = require('./backend')

// parse the command line arguments
commander
  .option('-u, --username [username]', 'Username')
  .option('-p, --password [password]', 'Password')
  .parse(process.argv);

var onConnected = function(client, user, pass){
  backend.students.update(user, pass, function(count){
    winston.log('info', 'Database sync finished. ');
    process.exit(0);
  });
};

var onConnectReady = function onConnectReady(user, pass){
  ldap.bind('', user, pass, function(err, client){
    if(err){
      winston.log('error', 'Could not connect to database at', ldap.url);
      winston.log('error', 'Fatal error encountered, exiting. ');
      process.exit(1);
    } else {
      winston.log('info', 'Connected to database at '+ldap.url);
      onConnected(client, user, pass);
      return;
    }
  });
};

// wait for db connection
db.awaitConnection(function(){

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
    onConnectReady(username, password);
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
    onConnectReady(answers.username, answers.password);
  });
});