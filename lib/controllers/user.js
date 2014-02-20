'use strict';

var ldap = require('ldapjs');
var settings = require('../../settings');
var tokenUtils = require('../utils/token');

exports.auth = function (req, res) {
  console.log(req.body);
  if (!req.body.username || !req.body.password) {
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
    url: 'ldap://'+settings.ldap.host+':'+settings.ldap.port
  });

  if (settings.DEBUG) {
    if (username === 'admin') {
      var token = tokenUtils.generateUser(username);
      res.json({
        token: token
      });
      return;
    }
  }

  client.bind(settings.ldap.prefix + username, password, function (err) {
    if (err === null) {
      var token = tokenUtils.generateUser(username);
      res.json({
        token: token
      });
      return;
    } else {
      res.errorJson('InvalidAuthentication');
      return;
    }
  });

  return;
};
