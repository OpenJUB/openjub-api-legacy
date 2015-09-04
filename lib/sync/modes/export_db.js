/**
 * File used for syncronisation with LDAP.
 */
var winston = require('winston');
var async = require('async');
var fs = require('fs');

var MongooseStudentModel = require('../../db/models').Student;

var doSync = function doSync(filename){
 async.series([
   MongooseStudentModel.find.bind(MongooseStudentModel, {})
 ], function(err, res){

   if(err){
     winston.log('error', 'Fatal error encountered, exiting. ');
     process.exit(1);
     return;
   }

   try{
     fs.writeFileSync(filename, JSON.stringify(res[0], null, 4));
     winston.log('info', 'Wrote '+res[0].length+' user(s) to \''+filename+'\'. ')
     process.exit(0);
   } catch(e){
      winston.log('error', 'Did not write to \''+filename+'\'. ');
      winston.log('error', e.message);
      winston.log('error', 'Fatal error encountered, exiting. ');
      process.exit(1);
   }
 });
};



module.exports = function(commander){
  async.series([
    function(next){
      var fileName = commander.export;

      if(!fileName || typeof fileName !== 'string'){
        winston.log('error', 'Missing filename. ');
        process.exit(1);
      }

      next(null, fileName);
    },
    function(next){
      return require('../backend/connect_db')(next);
    },
    function(next){
      return require('../backend/reload_phoneroom')(next);
    },
  ], function(err, res){
    if(err){
      process.exit(1);
    }

    winston.log('info', 'Starting export from Database. ');
    doSync(res[0]);
  });
};
