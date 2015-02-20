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
    callback(false, "InvalidRequest");
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
      callback(user, "InvalidRequest");
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
        req.session.keks = token;
        req.session.user = user;
        req.session.campus = false;  

        res.jsonp({
          "token": token, 
          "user": user
        })

      }); 
    } else {
      res.errorJson(error);
    }
  });

  return;
};
