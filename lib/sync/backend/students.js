var StudentModel = require('../../db/models').Student;
var Parser = require('../parser').student; 

var winston = require('winston'); 

module.exports.update = function(ad, next){
  winston.log('info', 'Querying ActiveDirectory, this might take a while. '); 
  
  ad.findUsers('', function(err, users) {
    if(err){
      winston.log('error', 'Error retrieving users. '); 
      winston.log('error', err.message); 
      process.exit(1); 
    }
    
    winston.log('info', 'Done, found '+users.length+' users. '); 
    
    // Cleanup all the found user objects. 
    winston.log('info', 'Cleaning up retrieved users, please wait. '); 
    
    var realUsers = users.map(Parser.parseStudent.bind(Parser));
    
    // TODO: Remove unused users. 
    
    // TODO: Begin syncing procedure. 
    
    
  });
}; 