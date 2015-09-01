var MongooseStudentModel = require('../../db/models').Student;

var studentModel = require('../../studentModel');
var sourceFields = studentModel.sourceComponents; 

var ldap = require('../../db/ldap');
var async = require('async');

var winston = require('winston');

function sync(newIds, newParsed, oldIds, next){
  var added = []; 
  var removed = []; 
  var updated = []; 
  
  newIds.map(function(e, idx){
    if(oldIds.indexOf(e) === -1){
      // it is not in the old ids => it is a new one. 
      added.push(newParsed[idx]); 
    } else {
      // it is in the old ids => it is an update. 
      updated.push(newParsed[idx]); 
    }
  });
  
  oldIds.map(function(e, idx){
    if(newIds.indexOf(e) === -1){
      // it is only in the old ids => it is a gone one
      removed.push(e); 
    }
  }); 
  
  // print out some stats
  winston.log('info', newIds.length+' user(s) retrieved from LDAD, '+oldIds.length+' user(s) currently inside database. ');
  winston.log('info', updated.length+' user(s) to be updated, '+added.length+' user(s) to be added, '+removed.length+' user(s) no longer in LDAP. '); 
  
  async.series([
    //updateUsers.bind(this, updated), 
    //addUsers.bind(this, added),
    //reparseUsers.bind(this, removed)
  ], function(err){
    if(err){
      process.exit(1); 
    } else {
      next(); 
    }
  }); 
}; 


function updateUsers(users, next){
  
}

function addUsers(users, next){
  // we add users by just saving them again in the database
  async.map(
    users,
    function(u, uNext){
      new MongooseStudentModel(u).save(uNext); 
    }, 
    function(err, res){
      if(err){
          winston.log('error', 'Error adding user(s). '); 
          winston.log('error', err.message); 
          next(err, res); 
          return; 
      }
      
      winston.log('info', ''+res.length+' user(s) added to the database. '); 
    }
  )
}

function reparseUsers(users, next){
  
}

module.exports.update = function(user, pass, next){
  winston.log('info', 'Querying ActiveDirectory, this might take a while. ');

  async.parallel(
    [
      function(unext){
        ldap.bindFields('ou=active,', user, pass, ['sAMAccountName', 'employeeID'], function(err, ad){
          if(err){
            unext(err, null);
          } else {
            ad.findUsers('', unext);
          }
        });
      },
      function(unext){
        ldap.bindFields('', user, pass, sourceFields, function(err, ad){
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

      winston.log('info', 'Done. ');
      winston.log('info', 'Checking for inactive users');

      // all the active users && all users
      var active = res[0];
      var all = res[1];

      // find all the active ids.
      var active_ids = active.map(function(entry, idx){
        return entry.employeeID;
      }); 
      
      var all_ids = []; 
      
      var active_count = 0;
      var inactive_count = 0;

      // inactive users: all without active.
      var users  = all.map(function(entry, idx){
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


      winston.log('info', 'Done, found '+active_count+' active and '+inactive_count+' inactive users. ');

      winston.log('info', 'Cleaning up retrieved users, please wait. ');

      // Cleanup user in paralell.
      async.map(users, studentModel.runImporter.bind(studentModel), function(err, newUsers){
        winston.log('info', 'Done, starting syconisation with database ...');
        MongooseStudentModel.find({}, 'eid', function(err, oldUsers){
          if(err){
              winston.log('info', 'Error finding existing users. ');
              winston.log('info', err.message);
              process.exit(1); 
          }
          
          var oldUserNames = oldUsers.map(function(e, idx){
            return parseInt(e['eid']); 
          }); 
          
          
          sync(all_ids, newUsers, oldUserNames, next); 
          return; 
        }); 
      });
    });
};
