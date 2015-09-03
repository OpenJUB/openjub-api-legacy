/**
 * File used for syncronisation with LDAP. 
 */
var winston = require('winston');
var async = require('async');
var fs = require('fs'); 

var import_ldap = require('../backend/import_ldap');
  
var doSync = function doSync(filename, user, pass){
 async.series([
   import_ldap.bind(this, {
     'username': user,
     'password': pass
   })
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
      var fileName = commander.exportLdap; 
      
      if(!fileName || typeof fileName !== 'string'){
        winston.log('error', 'Missing filename. '); 
        process.exit(1); 
      }
      
      next(null, fileName); 
    }, 
    function(next){
      return require('../backend/connect_ldap')(commander, next); 
    }
  ], function(err, res){
    if(err){
      process.exit(1); 
    }
    
    winston.log('info', 'Starting export from LDAP. '); 
    doSync(res[0], res[1][0], res[1][1]); 
  }); 
};