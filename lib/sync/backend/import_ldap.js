var winston = require('winston');
var async = require('async');

var MongooseStudentModel = require('../../db/models').Student;
var studentModel = require('../../studentModel');
var ldap = require('../../db/ldap');

module.exports = function(authentication, next){
  var username = authentication.username;
  var password = authentication.password;

  winston.log('info', 'Querying ActiveDirectory, this might take a while. ');

  async.parallel(
    [
      function(unext){
        ldap.bindFields('ou=active,', username, password, ['sAMAccountName', 'employeeID'], function(err, ad){
          if(err){
            unext(err, null);
          } else {
            ad.findUsers('', unext);
          }
        });
      },
      function(unext){
        ldap.bindFields('', username, password, studentModel.sourceComponents, function(err, ad){
          if(err){
            unext(err, null);
          } else {
            ad.findUsers('', unext);
          }
        });
      },
    ],
    function(err, res){
      if(err){
        winston.log('error', 'Error querying LDAP. ');
        winston.log('error', err.message)
        next(err, null);
        return;
      }

      winston.log('info', 'Done, now checking for active users. ');

      // all the active users && all users
      var active = res[0];
      var all = res[1];

      // find the ids of active users.
      var active_ids = active.map(function(entry, idx){
        return entry.employeeID;
      });

      // find all ids.
      var all_ids = [];

      // count active and inactive.
      var active_count = 0;
      var inactive_count = 0;

      // inactive users: all without active.
      var users = all.map(function(entry, idx){
        var obj = entry;
        all_ids.push(parseInt(entry.employeeID));

        if(active_ids.indexOf(entry.employeeID) === -1){
          obj.active = false;
          inactive_count++;
        } else {
          obj.active = true;
          active_count++;
        }

        return obj;
      });


      winston.log('info', 'Finished. Found '+active_count+' active and '+inactive_count+' inactive users. ');
      winston.log('info', 'Cleaning up retrieved users, please wait. ');

      // Cleanup all users.
      async.map(users, studentModel.runImporter.bind(studentModel), function(err, allUsers){
        winston.log('info', 'Done. ');

        if(err){
          next(err, null);
          return;
        }

        next(null, allUsers);
        return;
      });
    });
};
