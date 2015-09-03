/**
 * File used for syncronisation with LDAP. 
 */
var winston = require('winston');
var async = require('async');

var jsonUtils = require('../../utils/json');
var MongooseStudentModel = require('../../db/models').Student;

var import_ldap = require('../backend/import_ldap');
var update = require('../backend/update');
  
var doSync = function doSync(user, pass){
 async.series([
   require('../backend/remove_doubles'), 
   import_ldap.bind(this, {
     'username': user,
     'password': pass
   }),
   MongooseStudentModel.find.bind(MongooseStudentModel, {})
 ], function(err, res){

   if(err){
     winston.log('error', 'Fatal error encountered, exiting. ');
     process.exit(1);
     return;
   }

   var ldapUsers = res[1];
   var dbUsers = res[2];

   var hashing = function(e, idx){
     return parseInt(e['eid']);
   };
   
   var diff = jsonUtils.diffKey(ldapUsers, hashing, dbUsers, hashing);

   var added = diff[0]; //only in LDAP
   var removed = diff[1]; // only in DB
   var updated = diff[2]; // data in both.

   // some logging
   winston.log('info', ldapUsers.length+' user(s) retrieved from LDAP, '+dbUsers.length+' user(s) currently inside database. ');
   winston.log('info', updated.length+' user(s) to be updated, '+added.length+' user(s) to be added, '+removed.length+' user(s) no longer in LDAP. ');

   // and update, add && reparse.
   async.series([
     update.updateUsers.bind(this, updated),
     update.addUsers.bind(this, added),
     update.reparseUsers.bind(this, true, removed)
   ], function(err){
     if(err){
       process.exit(1);
     } else {
       winston.log('info', 'Successfully synchronised with LDAP. '); 
       process.exit(0); 
     }
   });
 });
};



module.exports = function(commander){
  async.series([
    function(next){
      return require('../backend/connect_ldap')(commander, next); 
    }, 
    function(next){
      return require('../backend/connect_db')(next); 
    },
    function(dNext){
      if(commander.drop){
        winston.log('info', 'Dropping database as instructed. '); 
        MongooseStudentModel.remove({}, dNext); 
      } else {
        dNext(null, null); 
      }
    }
  ], function(err, res){
    if(err){
      process.exit(1); 
    }
    
    winston.log('info', 'Starting synchronisation with LDAP. '); 
    doSync(res[0][0], res[0][1])
  }); 
};