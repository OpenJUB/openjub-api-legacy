/**
 * File used for syncronisation with LDAP. 
 */
var fs = require('fs'); 
var winston = require('winston');
var async = require('async');

var jsonUtils = require('../../utils/json');
var MongooseStudentModel = require('../../db/models').Student;
var studentModel = require('../../studentModel');

var import_ldap = require('../backend/import_ldap');
var update = require('../backend/update');
  
var doSync = function doSync(entries){
 async.series([
   function(rNext){
     winston.log('info', 'Parsing entries from file. '); 
     async.map(entries, studentModel.reParse, function(err, res){
      if(err){
        winston.log('error', 'Error parsing entries. '); 
        winston.log('error', err.message); 
        winston.log('Fatal error encountered, exiting. '); 
        process.exit(1); 
        return; 
      }
      
      rNext(null, res);
     })
   }, 
   MongooseStudentModel.find.bind(MongooseStudentModel, {})
 ], function(err, res){

   if(err){
     winston.log('error', 'Fatal error encountered, exiting. ');
     process.exit(1);
     return;
   }

   var fileUsers = res[0];
   var dbUsers = res[1];

   var hashing = function(e, idx){
     return parseInt(e['eid']);
   };
   
   var diff = jsonUtils.diffKey(fileUsers, hashing, dbUsers, hashing);

   var added = diff[0]; //only in LDAP
   var removed = diff[1]; // only in DB
   var updated = diff[2]; // data in both.

   // some logging
   winston.log('info', fileUsers.length+' user(s) retrieved from file, '+dbUsers.length+' user(s) currently inside database. ');
   winston.log('info', updated.length+' user(s) to be updated, '+added.length+' user(s) to be added, '+removed.length+' user(s) no longer in file. ');

   // and update, add && reparse.
   async.series([
     update.updateUsers.bind(this, updated),
     update.addUsers.bind(this, added),
     update.reparseUsers.bind(this, true, removed)
   ], function(err){
     if(err){
       process.exit(1);
     } else {
       winston.log('info', 'Successfully synchronised with file. '); 
       process.exit(0); 
     }
   });
 });
};



module.exports = function(commander){
  async.series([
    function(next){
      var fileName = commander.syncFile; 
      
      if(!fileName || typeof fileName !== 'string'){
        winston.log('error', 'Missing filename. '); 
        process.exit(1); 
      }
      
      try{
        var json = JSON.parse(fs.readFileSync(fileName, 'utf8'));
      } catch(e){
        winston.log('error', 'Error loading JSON: Unable to parse JSON. ');
        winston.log('error', e.message); 
        next(e, null); 
        return; 
      }
      
      if(!Array.isArray(json)){
        winston.log('error', 'Error loading JSON: Specefied file does not contain a JSON Array. ');
        winston.log('error', 'Fatal error encounted, exiting. '); 
        next(new Error('Specefied file does not contain a JSON Array. '), null); 
        return; 
      }
      
      winston.log('info', 'Loaded '+json.length+' entries from '+fileName); 
      next(null, json); 
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
    
    winston.log('info', 'Starting syncronisation with file. '); 
    doSync(res[0])
  }); 
};