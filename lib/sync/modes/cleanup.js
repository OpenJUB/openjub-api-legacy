/**
 * File used for syncronisation with LDAP.
 */
var winston = require('winston');
var async = require('async');

var MongooseStudentModel = require('../../db/models').Student;
var update = require('../backend/update');

var doReparse = function doReparse(){
 async.series([
   require('../backend/remove_doubles'),
   MongooseStudentModel.find.bind(MongooseStudentModel, {})
 ], function(err, res){

   if(err){
     winston.log('error', 'Fatal error encountered, exiting. ');
     process.exit(1);
     return;
   }

   // get all the us
   var dbUsers = res[1];

   // some logging
   winston.log('info', ''+dbUsers.length+' user(s) currently inside database. ');

   // and update, add && reparse.
   async.series([
     update.reparseUsers.bind(this, false, dbUsers)
   ], function(err){
     if(err){
       process.exit(1);
     } else {
       winston.log('info', 'Finished cleaning up database. ');
       process.exit(0);
     }
   });
 });
};



module.exports = function(commander){
  async.series([
    function(next){
      return require('../backend/connect_db')(next);
    }
  ], function(err, res){
    if(err){
      process.exit(1);
    }
    winston.log('info', 'Starting cleanup of database. ');
    doReparse();
  });
};
