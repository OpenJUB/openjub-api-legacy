'use strict';

var ldap = require('ldapjs');
var models = require('../models');
var settings = require('../../settings');
var tokenUtils = require('../utils/token');

/**
 * Controllers for authentication.
 * @namespace controllers.auth
 */

 /**
 * Check if an ip adress originates on campus.
 * @param {string} ip - Adress to check.
 * @private
 * @function controllers.auth.checkCampusIp
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
* @function controllers.auth.loginLDAP
*/
function loginLDAP(user, pass, callback){

  //normalise user
  user = user.toLowerCase().replace(/\s+/, "");

  //check for non-empty password.
  if(user === "" || pass === ""){
    callback(false, "InvalidAuthentication");
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
      callback(user, "InvalidAuthentication");
      return;
    }
  });
}

/**
* Checks if an ip-adress of a user is on campus.
* @param {request} req - Request object
* @param {response} res - Result object
* @function controllers.auth.checkCampus
*/
exports.checkCampus = function (req, res) {
  res.json({'on_campus': checkCampusIp(req.ip)});
};


/**
* Log in using
* @param {request} req - Request object
* @param {response} res - Result object
* @function controllers.auth.auth
*/
exports.login = function (req, res) {

  //check that we have username / password
  if (!req.body.username ||
      !req.body.password) {
    res.errorJson('InvalidRequest');
    return;
  }

  //extract the username and password
  var username = req.body.username;
  var password = req.body.password;

  //login to ldap
  loginLDAP(username, password, function(user, error){
    if(user){
      //sign the token
      var token = tokenUtils.generateUser(user);

      //build the entry
      var entry = new req.models.Token({'token': token, 'user': user, 'createdAt': new Date()});

      //save the token
      entry.save(function (err, entry) {
        if (err !== null) {
          res.errorJson('DatabaseProblem');
          return;
        }

        //Save some fancy data
        req.session.token = token;
        req.session.tokenId = entry.id;
        req.session.user = user;
        req.session.campus = false;

        //send back the status
        exports.status(req, res);
      });
    } else {
      res.errorJson(error);
    }
  });

  return;
};

function destroyAuth(req, res, callback){

  //try and load the token and username
  //we prefer the cookie, however we also use the GET params.
  var savedToken = req.session.token || req.query.token || false;
  var savedUser = req.session.user || req.query.user || false;
  var savedId = req.session.tokenId || req.query.tokenId || false;

  
}

/**
* Checks if a user is authenticated.
* @param {request} req - Request object
* @param {result} res - Result object
* @param {function} callback - Next thing to do.
* @function controllers.auth.checkAuth
* @private
*/
function checkAuth(req, res, callback){
  //try and load the token and username
  //we prefer the cookie, however we also use the GET params.
  var savedToken = req.session.token || req.query.token || false;
  var savedUser = req.session.user || req.query.user || false;
  var savedId = req.session.tokenId || req.query.tokenId || false;


  if(savedToken && savedUser && savedId){
    //If we have a user and token
    //we can try and authenticate.
    //we can then check if everything matches.


    //regen the token.
    var newToken = tokenUtils.generateUser(savedUser);


    if(newToken !== savedToken){
      //we do not have the same token.

      callback(false, 'TokenProblem');

      return;
    }

    //check it it is in the database
    // we need to find it by id.
    req.models.token.findById(savedId, function (err, entry) {

      //was the token found on the server side?
      //if so, everythign worked out properly.
      if (err !== null || entry === null) {
        callback(false, 'TokenNotFound');
        return;
      }

      //everything worked out as planned
      callback({
        'token': savedToken,
        'user': savedId,
        'campus': savedId
      });
  });



  } else if(checkCampusIp(req.ip)){
    //if we are on campus
    //we can still use things.

    req.session.token = '';
    req.session.user = undefined;
    req.session.campus = true;

    callback({
      'token': '',
      'user': undefined,
      'campus': true
    });
  } else {
    //we could not find the token
    //and are not on campus.
    callback(false, "TokenNotFound");
  }
}

/**
* Checks if a user is authenticated.
* @param {request} req - Request object
* @param {result} res - Result object
* @param {function} next - Next thing to do.
* @function controllers.auth.need
*/
exports.need = function (req, res, next) {
  checkAuth(req, res, function(session, error){
    if(session){
      //we have a session.

      //so save it
      req.session.token = session.token;
      req.session.user = session.user;
      req.session.campus = session.campus;

      //and move on.
      next();
    } else {

      //nope it didn't work.
      req.session.destroy(function(){
        res.errorJSON(error);
      });
    }
  });
};


exports.status = function(req, res){
  //send the status to the user.

  res.jsonp({
    "campus": req.session.campus,
    "user": req.session.user || undefined,
    "token": req.session.token
  });
}
