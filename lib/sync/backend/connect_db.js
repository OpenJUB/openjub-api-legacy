var db = require('../../db');

module.exports = function(next){
  db.awaitConnection(function(){
    next(null, true); 
  });
}; 
