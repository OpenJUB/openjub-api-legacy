'use strict';

/**
* Defines all middleware used by Express.
* @namespace middleware
*/

var jwt = require('jsonwebtoken');
var settings = require('../settings');

/**
* Checks a token submitted by a request.
* @param {request} req - Request object
* @param {result} res - Result object
* @param {function} next - Next thing to do.
* @function middleware.checkToken
*/
exports.checkToken = function (req, res, next) {
  //TODO: rewrite this
  
  var token;

  //do not check token whilst in debug mode.
  if (settings.DEBUG === true) {
    next();
    return;
  }

  //check the headers for a token.
  if (req.headers && req.headers.authorization) {
    var parts = req.headers.authorization.split(' ');
    if (parts.length === 2) {
      var scheme = parts[0];
      var credentials = parts[1];

      if (/^Bearer$/i.test(scheme)) {
        token = credentials;
      }
    } else {
      res.errorJson('NoTokenSpecified');
      return;
    }
  } else if (settings.token.acceptInBody) {
    if (req.body.token) {
      token = req.body.token;
    } else if (req.query.token) {
      token = req.query.token;
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token.replace(/\"/g, '');
    } else {
      res.errorJson('NoTokenSpecified');
      return;
    }
  } else {
    res.errorJson('NoTokenSpecified');
    return;
  }

  //ok, we have a token.
  if (token) {
    jwt.verify(token, settings.token.secret, settings.token.options,
      function (err, decoded) {
        if (err) {
          res.errorJson('TokenProblem');
          return;
        }
        req.access = decoded;
        next();
      });
  } else {
    res.errorJson('NoTokenSpecified');
  }
};
