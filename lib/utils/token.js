'use strict';

/**
* Utility functions for tokens.
* @namespace utils.token
*/

var jwt = require('jsonwebtoken');
var settings = require('../../settings');

var templateInfo = {
  username: '',
  role: '',
  client_id: ''
};

/**
 * Copies a JSON-style object.
 * @param {object} json - JSON-style object to copy.
 * @returns {object} - Copy of the given object.
 * @function utils.token.copyJson
 * @private
 */
function copyJson (json) {
  return JSON.parse(JSON.stringify(json));
}

/**
 * Validates an object by checking none of the given parameters are undefined.
 * @param {object} json - Object to validate.
 * @param {string[]} keys - Keys of the object to check.
 * @returns {boolean} - indicating if the object is valid.
 * @function utils.token.validateJson
 * @private
 */
function validateJson (json, keys) {
  var valid = true;
  keys.forEach(function (p) {
    if (json[p] === undefined) {
      valid = false;
    }
  });
  return valid;
}

/**
 * Generates a webtoken for a user.
 * @param {string} username - Username
 * @param {string} clientId - Client id of user.
 * @returns {JWTToken} - json web token for the given user and client id.
 * @function utils.token.generateUser
 */
exports.generateUser = function (username, clientId) {
  var info = copyJson(templateInfo);
  info.username = username;
  info.role = 'user';
  info.client_id = clientId;

  return jwt.sign(info, settings.token.secret, settings.token.options);
};

/**
 * Generates a webtoken for a developer (application).
 * @param {object} devInfo - Information about the developer.
 * @returns {JWTToken} - json web token for the developer
 * @function utils.token.generateDeveloper
 */
exports.generateDeveloper = function (devInfo) {
  //TODO: Completely remove developer tokens.
  var valid = validateJson(devInfo, ['app', 'name', 'email', 'description']);
  if (!valid) {
    return null;
  }
  var info = copyJson(templateInfo);
  info.app = devInfo.app;
  info.name = devInfo.name;
  info.email = devInfo.email;
  info.description = devInfo.description;
  info.role = 'developer';

  return jwt.sign(info, settings.token.secret);
};
