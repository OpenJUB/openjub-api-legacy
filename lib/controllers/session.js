'use strict';

/**
* Implementation of session backend.
* @namespace controllers.session
*/

var jwt = require('jsonwebtoken');
var settings = require('../../settings');

/** Creates a new user session with the given data.
* @param {request} req - Request object
* @param {string} user - User to create session for.
* @param {function} callback - Function to call with token.
*/
exports.createSession = function(req, user, callback){

  //create a new entry
  var entry = new req.models.Session({
    'user': user,
    'createdAt': new Date()
  });

  //save the entry in the database.
  entry.save(function(err, entry){

    //failed to save.
    if(err !== null){
      callback(false);
      return;
    }

    //create a token and send it to the client.
    var token = jwt.sign({'id': entry.id}, settings.token.secret);

    //send the token to the client.
    callback(token);
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
    //load the id
    var id = data && data.id;

    //if we have an error or no id
    //we should just fail.
    if(err !== null || !id){
      callback(false);
      return;
    }

    //try and find the model
    req.models.Session.findById(id, function (err, entry) {

      //there was an error or we could not find the entry
      if (err !== null || entry === null) {
        callback(false);
        return;
      }

      //everything worked out as planned
      callback(entry.user);
    });
  });
};

/** Deletes a session from the server.
* @param {request} req - Request object
* @param {function} callback - Function to call.
*/
exports.deleteSession = function(req, callback){
  //load the token
  var token = req.token;

  //if we do not have the user, please fail.
  if(!token){
    callback(false);
    return;
  }

  //decrypt the token
  jwt.verify(token, settings.token.secret, function(err, id){

    //if we have an error or no id
    //we should just fail.
    if(err !== null || !id){
      callback(false);
      return;
    }

    //try and delete the id.
    req.models.Session.findByIdAndRemove(id, function (err, entry) {

      //there was an error or we could not find the entry
      if (err !== null) {
        callback(false);
        return;
      }

      //everything worked out as planned
      callback(true);
    });
  });
};
