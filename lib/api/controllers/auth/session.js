'use strict';

/**
* Implementation of session backend.
* @namespace controllers.session
*/

var jwt = require('jsonwebtoken');
var settings = require('../../../settings');
var models = require('../../../db/models');
var MongooseStudentModel = models.Student;

/** Creates a new user session with the given data.
* @param {request} req - Request object
* @param {string} user - User to create session for.
* @param {function} callback - Function to call with token.
*/
exports.createSession = function(req, user, callback){
  
  // check that the user exists. 
  MongooseStudentModel.count({username: user}, function(err, count){
    // user does not exist in db => we return
    if(err || count == 0){
      callback(false); 
      return;
    }
    
    // create a new entry
    var entry = new models.Session({
      'user': user,
      'createdAt': new Date(), 
      'touchedAt': new Date()
    });

    //save the entry in the database.
    entry.save(function(err, entry){
      
      if(err !== null){
        callback(false);
        return;
      }

      //create a token and send it to the client.
      var token = jwt.sign({
        'id': entry.id, 
        'user': user, 
        'createdAt': entry.createdAt.toString()
      }, settings.token.secret);

      //send the token to the client.
      callback(token);
    });
  }); 
};

/** Decodes and verifies a session with the database.
* @param {request} req - Request object
* @param {function} callback - Function to call with decoded username.
*/
exports.decodeSession = function(req, callback){

  //load the token
  var token = req.token;

  //if we do not have the user, please fail.
  if(!token){
    callback(false);
    return;
  }

  //decrypt the token
  jwt.verify(token, settings.token.secret, function(err, data){
    
    // load all the properites
    var id = data && data.id;
    var user = data && data.user; 
    var createdAt = data && data.createdAt; 
    
    // if there is some kind of error
    if(err || !id || !user || !createdAt){
      callback(false);
      return;
    }
    
    // now try to find the session. 
    models.Session.findById(id, function (err, entry) {

      //entry is missing. 
      if (err || !entry) {
        callback(false);
        return;
      }
      
      var eUser = entry.user; 
      var eCreatedAt = entry.createdAt.toString(); 

      //check that creation data and user match
      if(eUser !== user || eCreatedAt !== createdAt){
        callback(false);
        return;
      }
      
      // touch the session. 
      entry.touchedAt = new Date(); 
      
      // and save it. 
      entry.save(function(){
        MongooseStudentModel.findOne({username: entry.user}, function(err, doc){
          if(err || !doc){
            callback(false); 
          } else {
            callback(doc, id);
          }
        }); 
      }); 
    });
  });
};

/** Deletes a session from the server.
* @param {request} req - Request object
* @param {function} callback - Function to call.
*/
exports.deleteSession = function(req, callback){
  exports.decodeSession(req, function(user, id){
    
    if(!id){
      callback(false); 
      return; 
    }
    
    models.Session.findByIdAndRemove(id, function(err){
      delete req.cookies.openjub_token; 
      callback(err?true:false);
    }); 
  }); 
};
