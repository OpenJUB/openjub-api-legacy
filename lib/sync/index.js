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
  .option('-c, --clean', 'Cleanly sync the database and forget about the old students. ')
  .option('-v, --verbose', 'Be verbose and say what you are doing. ')
  .option('-u, --username [username]', 'Username')
  .option('-p, --password [password]', 'Password')
  .parse(process.argv);

var onConnected = function(client, user, pass){
  backend.students.update(user, pass, function(count){
    winston.log('info', ''+count+' students updated. ');
    process.exit(1);
  });
};

var onConnectReady = function onConnectReady(user, pass){
  ldap.bind('', user, pass, function(err, client){
    if(err){
      winston.log('error', 'Could not connect to database at', lap.url);
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

/*
// Set up ldap
var ldapjs = require('ldapjs');
var ldap = ldapjs.createClient({url:'ldap://jacobs.jacobs-university.de'});

// load a bunch of local packages
var modelImport = require('../lib/models');
var pkg = require('../package');
var settings = require('../settings');

// command line arguments to parse


var Models; // holds all models available

function setup(callback) {
  console.log('INFO'.cyan + ' Creating connection to database');
  console.log('OK'.green + ' Connection established');

  var user, password;

  var questions = [];

  if (program.username) {
    user = program.username;
  }
  else {
    questions.push({
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
    });
  }

  if (program.password) {
    password = program.password;
  }
  else {
    questions.push({
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
    });
  }

  inquirer.prompt(questions, function (answers) {
    user = user || answers.username;
    password = password || answers.password;

    ldap.bind(user+'@'+settings.ldap.host, password, function(err) {
      if (!(err === null)) {
        console.log(err);
        console.log('ERR'.red + " Couldn't login with the details provided");
        process.exit(-1);
      }

      callback();
    });

    return;

  });

};

function drop () {
  console.log('WARN'.yellow + ' Dropping all entries in the database');

  Models.Student.remove(function(err) {
    if (!(err === null)) {
      console.log('ERR'.red + ' Failed to remove the students. Error: ' + err);
    }
  });

  Models.Course.remove(function(err) {
    if (!(err === null)) {
      console.log('ERR'.red + ' Failed to remove the courses. Error: ' + err);
    }
  });

  console.log('OK'.green + ' All data dropped');
  return;
};

function update () {
  console.log('INFO'.cyan + ' Updating all entries in database');
  var studentsDone, coursesDone;

  //first get the students
  getStudents(function(count, errors) {
    console.log('INFO'.cyan + ' Students retrieved (total: '+count +', errors: '+errors+')');
    studentsDone = 1;

    //and then the courses
    getCourses(function(count, errors) {
      console.log('INFO'.cyan + ' Courses retrieved (total: '+count+', errors:  '+errors+')');
      coursesDone = 1;
      cleanup(studentsDone, coursesDone);
    });
  });



  return;
};

function cleanup(s,c) {
  if (!s || !c) {
    return;
  }

  console.log('OK'.green + ' All entries updated');
  ldap.unbind(function(err) {
    if (!(err === null)) {
      console.log('ERR'.red + " Couldn't unbind from LDAP (nothing will probably happen, but bad nonetheless)");
    }
  });

  process.exit();
};


function getStudents(callback) {

  var alphabet = "abcdefghijklmnopqrstuvwxyz";
  var for_count = 0;
  var count = 0;
  var errors = 0;
  var block = 0;

  //we don't want to have mroe than one query at a time as that might result in bugs.
  var iteration = function(i){
    if(i <= alphabet.length){
      var opts = {
        filter: '(sAMAccountName='+alphabet[i]+'*)',
        scope: 'sub'
      };

      ldap.search('OU=Users,OU=CampusNet,DC=jacobs,DC=jacobs-university,DC=de', opts, function(err,search) {

        if (!(err === null)) {
          console.log('ERR'.red + " Couldn't retrieve students from LDAP. Error: " + err);
        }

        search.on('searchEntry', function (entry) {
          block++;
          var obj = parseStudent(entry.object);

          if (obj === null) {
            console.log('WARN'.yellow + " Student can't be parsed. Ignoring..");
            errors++;
            block--;
            return;
          }

          Models.PhoneRoom.findOne({'phone':obj.phone}, function (err, entry) {
            if (err) {
              console.log('ERR'.red + " Couldn't retrieve room. Error: " + err);
            }
            if (entry) {
              obj.room = entry.room;
            } else {
              obj.room = '';
            }
            count++;
            save_student(obj, function(){
              block--;
            });
          });
        });

        search.on('end', function(result) {
          if (++for_count == alphabet.length) {
            var next = function(){
              if(block > 0){
                return setTimeout(next, 1000);
              }
              callback(count, errors);
            }

            next();

          } else {
            iteration(i+1); //next iteration after the end. scripts/cd
          }
        });
      });
    }
  };

  iteration(0);
};

function getCourses(callback) {

  var alphabet = "0123456789AJ";
  var for_count = 0;
  var count = 0;
  var errors = 0;
  var block = 0;

  //make sure we only have one query at a time.
  var iteration = function(i){
    if(i < alphabet.length){
      var opts = {
        filter: '(CN=GS-CAMPUSNET-COURSE-'+alphabet[i]+'*)',
        scope: 'sub'
      };

      ldap.search('OU=Groups,OU=CampusNet,DC=jacobs,DC=jacobs-university,DC=de', opts, function(err,search) {
        if (!(err === null)) {
          console.log('ERR'.red + " Couldn't retrieve the courses from LDAP. Error: " + err);
        }

        search.on('searchEntry', function (entry) {
          block++;
          var obj = parseCourse(entry.object);

          if (obj === null) {
            console.log('WARN'.yellow + " Course can't be parsed. Ignoring..");
            errors++;
            block--;
            return;
          }

          count++;
          save_course(obj, function(){
            block--;
          });
        });

        search.on('end', function(result) {
          if (++for_count == alphabet.length) {
            var next = function(){
              if(block > 0){
                return setTimeout(next, 1000);
              }
              callback(count, errors);
            }

            next();
          } else {
            iteration(i+1);
          }
        });
      });
    }
  };

  iteration(0);

};

function save_student(obj, callback) {
  Models.Student.update({username: obj.username}, obj, {upsert: true}, function (err) {
    if (!(err === null)) {
      console.log('ERR'.red + ' Failed to update/insert the student with error: ' + err);
    }

    callback();
  });
}

(function main () {
  setup(function() {
    if (program.drop) {
      drop();
    }

    update();
  });
  return;
})();
*/
