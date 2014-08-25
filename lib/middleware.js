'use strict';

var jwt = require('jsonwebtoken');
var settings = require('../settings');

exports.checkToken = function (req, res, next) {
  /*jshint camelcase: false*/
  var token;

  if (settings.DEBUG === true) {
    next();
    return;
  }

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
