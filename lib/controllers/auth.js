'use strict';

var ldap = require('ldapjs');
var settings = require('../../settings');
var tokenUtils = require('../utils/token');

exports.onCampus = function (req, res) {
  /*jshint camelcase: false*/
  var ip = req.ip;
  console.log(req.ip);

  if (!req.query.client_id) {
    res.errorJson('InvalidRequest');
  }

  if (ip === '127.0.0.1' || ip.indexOf('10.') === 0 || ip == "::1") {
    var token = tokenUtils.generateUser('campusUser', req.query.client_id);
    res.json({'token': token});
  } else {
    res.errorJson('NotOnCampus');
  }

  res.json({'ip': ip});
};

exports.auth = function (req, res) {
  /*jshint camelcase: false */
  if (!req.body.username ||
      !req.body.password ||
      !req.body.client_id ||
      !req.body.response_type ||
      !req.body.redirect_uri
    ) {
    res.errorJson('InvalidRequest');
    return;
  }

  var username = req.body.username;
  var password = req.body.password;

  if (username.length === 0 || password.length === 0) {
    res.errorJson('EmptyUsernameOrPassword');
    return;
  }

  var client = ldap.createClient({
    url: 'ldap://'+settings.ldap.host
  });

  client.bind(username + '@' + settings.ldap.host, password, function (err) {
    if (err === null) {
      var token = tokenUtils.generateUser(username, req.body.client_id);
      if (req.body.response_type === 'token') {
        res.redirect(req.body.redirect_uri + '#token=' + token);
      } else if (req.body.response_type === 'code') {
        var entry = new req.models.AuthToken({'token': token, 'createdAt': new Date()});
        entry.save(function (err, entry) {
          if (err !== null) {
            res.errorJson('DatabaseProblem');
            return;
          }
          res.redirect(req.body.redirect_uri + '?code=' + entry.id);
        });
      } else {
        res.errorJson('InvalidRequest');
      }
      return;
    } else {
      res.redirect(req.body.redirect_uri + '#error=access_denied');
      return;
    }
  });

  return;
};

exports.token = function (req, res) {
  var code = req.body.code;

  req.models.AuthToken.findById(code, function (err, entry) {
    if (err !== null || entry === null) {
      res.errorJson('TokenNotFound');
      return;
    }
    res.json({'token': entry.token});
    entry.remove();
    return;
  });
};

exports.login = function (req, res) {
  /*jshint camelcase: false */
  var query = req.query;

  if (!query.client_id || !query.response_type || !query.redirect_uri) {
    res.errorJson('InvalidRequest');
  }
  res.render('login', query);
};

exports.callback = function (req, res) {
  res.render('callback');
};
