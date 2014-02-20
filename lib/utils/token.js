'use strict';

var jwt = require('jsonwebtoken');
var settings = require('../../settings');

var templateInfo = {
  username: '',
  role: ''
};

function copyJson (json) {
  return JSON.parse(JSON.stringify(json));
}

function validateJson (json, params) {
  var valid = true;
  params.forEach(function (p) {
    if (json[p] === undefined) {
      valid = false;
    }
  });
  return valid;
}

exports.generateUser = function (username) {
  var info = copyJson(templateInfo);
  info.username = username;
  info.role = 'user';

  return (jwt.sign(info, settings.token.secret, settings.token.options));
};

exports.generateDeveloper = function (devInfo) {
  var valid = validateJson(devInfo, ['username', 'name', 'email', 'description']);
  if (!valid) {
    return null;
  }
  var info = copyJson(templateInfo);
  info.username = devInfo.username;
  info.name = devInfo.name;
  info.email = devInfo.email;
  info.description = devInfo.description;
  info.role = 'developer';

  return (jwt.sign(info, settings.token.secret));
};
