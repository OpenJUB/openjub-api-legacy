'use strict';

var backend = require("./backend");

var session = require('./session');
var settings = require('../../../settings');
var jsonUtils = require('../../../utils/json');

/**
 * Controllers for authentication.
 * @namespace controllers.auth
 */
 
/**
* Checks if an ip-adress of a user is on campus.
* @param {request} req - Request object
* @param {response} res - Reponse object
* @function controllers.auth.checkCampus
*/
exports.checkCampus = function (req, res) {
  res.json({'on_campus': backend.checkCampusIp(req.ip)});
};


/**
* Log in using CampusNet details.
* @param {request} req - Request object
* @param {response} res - Reponse object
* @function controllers.auth.signin
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
      res.errorJson('AlreadyAuthenticated');
      return;
    }

    //extract the username and password
    var username = jsonUtils.ensureString(req.body.username, '');
    var password = jsonUtils.ensureString(req.body.password, '');

    //login to ldap
    backend.loginLDAP(username, password, function(user){
      //if we could not login
      // we need to tell the user.
      if(!user) {
        res.errorJson('InvalidAuthentication');
        return;
      }

      //try and create a session
      session.createSession(req, user, function(token){

        //store the token in the session
        //and also in the request itself

        //TODO: Have a no-cookie parameter.
        res.cookie('openjub_token', token, { maxAge: settings.token.options.expiresInMinutes*1000*60, httpOnly: true });
        req.cookies.openjub_token = token;
        req.token = token;

        //expose username
        req.user = user;

        //send the status to the user
        exports.status(req, res);
      });
    });
  });
};

/**
* Logs out of a campusnet session.
* @param {request} req - Request object
* @param {response} res - Reponse object
* @function controllers.auth.signout
*/
exports.signout = function (req, res) {

  //parse the token we want to decode
  req.token = req.cookies.openjub_token || req.query.token;

  //try and decode a session
  session.decodeSession(req, function(hasSession){
    //we did not have a session.
    //so we can not logout.
    if(!hasSession){
      res.errorJson('TokenNotFound');
      return;
    }

    //destroy the session
    session.deleteSession(req, function(err){

      //something else happened
      //we can not do anything about it for now.
      if(err){
        res.errorJson('UnknownError');
        return;
      }

      //delete the cookie
      res.clearCookie('openjub_token');

      //We successfully logged out.
      res.status(200).jsonp({
        'success': true
      });
    });
  });
};

/**
* Checks if a user is authenticated.
* @param {request} req - Request object
* @param {result} res - Reponse object
* @param {function} next - Next thing to do.
* @function controllers.auth.need
*/
exports.need = function (req, res, next) {

  //parse the token we want to decode
  req.token = jsonUtils.ensureString(req.cookies.openjub_token || req.query.token, '');

  session.decodeSession(req, function(user){
    //if we do not have a user and are not on campus
    //then we are not authenticated
    if(!user && !backend.checkCampusIp(req.ip)){

      //delete the cookie
      res.clearCookie('openjub_token');

      //delete the error json.
      res.errorJson('TokenNotFound');
      return;
    }

    //otherwise we can expose the user.
    req.user = user;

    //if we had the cookie, we want to re-send it.
    if(req.cookies.openjub_token){
      res.cookie('openjub_token', req.cookies.openjub_token, { maxAge: settings.token.options.expiresInMinutes*1000*60, httpOnly: true });
    }
    
    //and move on to the next thing.
    next();
  });
};

/**
* Checks the status of a user.
* @param {request} req - Request object
* @param {result} res - Reponse object
* @function controllers.auth.status
*/
exports.status = function(req, res){
  //send the status to the user.
  res.status(200).jsonp({
    'user': req.user,
    'token': req.token
  });
};

/**
* Called to check if a login form was successfull.
* @param {request} req - Request object
* @param {result} res - Reponse object
* @param {function} callback - What to do next
* @function controllers.authview_login
*/
exports.view_login = function(req, res, next){
  //if we do not have username + password, we need to try again
  if (!req.body.username ||
      !req.body.password) {
    next();
    return;
  }

  //now check if we can login.
  //extract the username and password
  var username = jsonUtils.ensureString(req.body.username, '');
  var password = jsonUtils.ensureString(req.body.password, '');

  //login to ldap
  backend.loginLDAP(username, password, function(user){
    //if we could not login
    //we need to prompt the user to try again.
    if(!user) {
      next();
      return;
    }

    //try and create a session
    session.createSession(req, user, function(token){
      //token was created.
      //we can now redirect to the callback
      //which will inform the original request.
      res.redirect('/view/callback?token='+token);
    });
  });
};
