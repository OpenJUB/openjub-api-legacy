'use strict';

var ldap = require('ldapjs');
var session = require('./session');
var settings = require('../../settings');


/**
 * Controllers for authentication.
 * @namespace controllers.login
 */

 /**
 * Check if an ip adress originates on campus.
 * @param {string} ip - Adress to check.
 * @private
 * @function controllers.login.checkCampusIp
 */
function checkCampusIp(ip) {
  return (
    //subnet 10.*.*.*
    ip.indexOf('10.') === 0 ||
    ip.indexOf('::ffff:10.') === 0 ||

    //localhost 127.0.0.1 / ::1
    ip === '127.0.0.1' ||
    ip === '::ffff:127.0.0.1' ||
    ip === '::1'
  );
}

/**
* Tries to login the user to ldap.
* @param {string} user - Username to login with.
* @param {string} pass - Password to login with.
* @private
* @function controllers.login.loginLDAP
*/
function loginLDAP(user, pass, callback){

  //normalise user
  user = user.toLowerCase().replace(/\s+/, "");

  //check for non-empty password.
  if(user === "" || pass === ""){
    callback(false);
    return;
  }

  //create an LDAP client.
  var client = ldap.createClient({
    url: 'ldap://'+settings.ldap.host
  });

  //bind to it.
  client.bind(user + '@' + settings.ldap.host, pass, function (err) {
    if(err){
      callback(false);
      return;
    } else {
      callback(user);
      return;
    }
  });
}

/**
* Checks if an ip-adress of a user is on campus.
* @param {request} req - Request object
* @param {response} res - Reponse object
* @function controllers.login.checkCampus
*/
exports.checkCampus = function (req, res) {
  res.json({'on_campus': checkCampusIp(req.ip)});
};


/**
* Log in using CampusNet details.
* @param {request} req - Request object
* @param {response} res - Reponse object
* @function controllers.login.signin
*/
exports.signin = function (req, res) {

  //check that we have username / password
  if (!req.body.username ||
      !req.body.password) {
    res.errorJson('InvalidRequest');
    return;
  }

  //try and decode a session
  session.decodeSession(req, function(hasSession){
    //we already have a session
    //so the client made a bad request.
    if(hasSession){
      res.errorJSON('AlreadyAuthenticated');
      return;
    }

    //extract the username and password
    var username = req.body.username;
    var password = req.body.password;

    //login to ldap
    loginLDAP(username, password, function(user){
      //if we could not login
      // we need to tell the user.
      if(!user) {
        res.errorJSON('InvalidAuthentication');
        return;
      }

      //try and create a session
      session.createSession(req, user, function(token){

        //store the token in the session
        //and also in the request itself
        req.session.token = token;
        req.token = token;

        //expose username
        req.user = user;

        //send the status to the user
        exports.status(req, res);
      })
    });
  });
};

/**
* Logs out of a campusnet session.
* @param {request} req - Request object
* @param {response} res - Reponse object
* @function controllers.login.signout
*/
exports.signout = function (req, res) {

  //parse the token we want to decode
  req.token = req.session.token || req.query.token;

  //try and decode a session
  session.decodeSession(req, function(hasSession){
    //we did not have a session.
    //so we can not logout.
    if(!hasSession){
      res.errorJSON('TokenNotFound');
      return;
    }

    //destroy the session
    session.deleteSession(req, function(err){

      //something else happened
      //we can not do anything about it for now.
      if(err){
        res.errorJSON('UnknownError');
        return;
      }

      //delete the session.
      req.session = null;

      //We successfully logged out.
      res.jsonp({
        "success": true
      });
    });
  });
};

/**
* Checks if a user is authenticated.
* @param {request} req - Request object
* @param {result} res - Reponse object
* @param {function} next - Next thing to do.
* @function controllers.login.need
*/
exports.need = function (req, res, next) {

  //parse the token we want to decode
  req.token = req.session.token || req.query.token;

  session.decodeSession(req, function(user){
    //if we do not have a user and are not on campus
    //then we are not authenticated
    if(!user && !checkCampusIp(req.ip)){

      //delete the session
      req.session = null;

      //delete the error json.
      res.errorJSON('TokenNotFound');
      return;
    }

    //otherwise we can expose the user.
    req.user = user;

    //and move on to the next thing.
    next();
  });
};


exports.status = function(req, res){
  //send the status to the user.
  res.jsonp({
    "user": req.user,
    "token": req.token
  });
}
