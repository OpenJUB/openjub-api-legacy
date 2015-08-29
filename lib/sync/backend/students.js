var StudentModel = require('../../db/models').Student;
var Parser = require('../parser').student;
var ldap = require('../../db/ldap');
var async = require('async');

var winston = require('winston');

module.exports.update = function(user, pass, next){
  winston.log('info', 'Querying ActiveDirectory, this might take a while. ');

  async.parallel(
    [
      function(unext){
        ldap.bind('ou=active,', user, pass, function(err, ad){
          if(err){
            unext(err, null);
          } else {
            ad.findUsers('', unext);
          }
        });
      },
      function(unext){
        ldap.bind('', user, pass, function(err, ad){
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
        winston.log('error', 'Error retrieving users. ');
        winston.log('error', err.message);
        process.exit(1);
      }

      winston.log('info', 'Done, now checking active status. ');

      // all the active users && all users
      var active = res[0];
      var all = res[1];

      // find all the active ids.
      var active_ids = active.map(function(entry, idx){
        return entry.employeeID;
      })

      var active_count = 0;
      var inactive_count = 0;

      // inactive users: all without active.
      var users  = all.map(function(entry, idx){
        var obj = entry;

        if(active_ids.indexOf(entry.employeeID) === -1){
          obj.active = false;
          inactive_count++;
        } else {
          obj.active = true;
          active_count++;
        }

        return obj;
      });


      winston.log('info', 'Done, found '+active_count+' active and '+inactive_count+' inactive users. ');

      winston.log('info', 'Cleaning up retrieved users, please wait. ');

      // Cleanup user in paralell.
      async.map(users, Parser.parseStudent.bind(Parser), function(err, realUsers){
        console.log(realUsers.length);
        console.log(Parser.the_types);

        process.exit(0);
      });
    });
};
