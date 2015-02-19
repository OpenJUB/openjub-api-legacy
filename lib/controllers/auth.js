'use strict';

var ldap = require('ldapjs');
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
};

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
* Returns an auth-token if a user is on campus.
* @param {request} req - Request object
* @param {response} res - Result object
* @function controllers.auth.onCampus
*/
exports.onCampus = function (req, res) {

  //get the ip.
  var ip = req.ip;

  //the client does not have an id
  //TODO: remove this.
  if (!req.query.client_id) {
    res.errorJson('InvalidRequest');
  }

  //if we are on campus
  if (checkCampusIp(ip)) {

    //generate a token
    var token = tokenUtils.generateUser('campusUser', req.query.client_id);
    res.json({'token': token});
  } else {

    //do not generate a token
    res.errorJson('NotOnCampus');
  }
};

/**
* Authenticates a user using campusnet password.
* @param {request} req - Request object
* @param {response} res - Result object
* @function controllers.auth.auth
*/
exports.auth = function (req, res) {

  //check that we have all these things.
  //TODO: Use a helper function for this.
  if (!req.body.username ||
      !req.body.password ||
      !req.body.client_id ||
      !req.body.response_type ||
      !req.body.redirect_uri
    ) {
    res.errorJson('InvalidRequest');
    return;
  }

  //extract the username and password
  //TODO: normalise.
  var username = req.body.username;
  var password = req.body.password;

  //they should be non-empty
  //TODO: Check if we have to trim whitespace
  if (username.length === 0 || password.length === 0) {
    res.errorJson('EmptyUsernameOrPassword');
    return;
  }

  //create an LDAP client.
  var client = ldap.createClient({
    url: 'ldap://'+settings.ldap.host
  });

  //bind to it.
  client.bind(username + '@' + settings.ldap.host, password, function (err) {
    if (err === null) {
      //generate a token for the user.
      var token = tokenUtils.generateUser(username, req.body.client_id);


      if (req.body.response_type === 'token') {
        //redirect to the token page.
        res.redirect(req.body.redirect_uri + '#token=' + token);
      } else if (req.body.response_type === 'code') {

        //redirect to the code page.
        var entry = new req.models.AuthToken({'token': token, 'createdAt': new Date()});
        entry.save(function (err, entry) {
          if (err !== null) {
            res.errorJson('DatabaseProblem');
            return;
          }
          res.redirect(req.body.redirect_uri + '?code=' + entry.id);
        });

      } else {
        //bump
        res.errorJson('InvalidRequest');
      }
      return;
    } else {

      //there was an error
      res.redirect(req.body.redirect_uri + '#error=access_denied');
      return;
    }
  });

  return;
};

/**
* Resturns a token if the user is properly authenticated.
* @param {request} req - Request object
* @param {response} res - Result object
* @function controllers.auth.token
*/
exports.token = function (req, res) {
  var code = req.body.code;

  //find the auth token.
  req.models.AuthToken.findById(code, function (err, entry) {
    //not found
    if (err !== null || entry === null) {
      res.errorJson('TokenNotFound');
      return;
    }

    //here it is.
    res.json({'token': entry.token});
    entry.remove();
    return;
  });
};

/**
* Shows a login page.
* @param {request} req - Request object
* @param {response} res - Result object
* @function controllers.auth.login
*/
exports.login = function (req, res) {
  var query = req.query;

  //missing client_id.
  //TODO: Remove this.
  if (!query.client_id || !query.response_type || !query.redirect_uri) {
    res.errorJson('InvalidRequest');
  }

  //render the login page.
  res.render('login', query);
};

/**
* Renders a callback page.
* @param {request} req - Request object
* @param {response} res - Result object
* @function controllers.auth.callback
*/
exports.callback = function (req, res) {
  //What is this?
  res.render('callback');
};
