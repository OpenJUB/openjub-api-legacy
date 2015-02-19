'use strict';

/**
* Utility functions for tokens.
* @namespace utils.token
*/

var jwt = require('jsonwebtoken');
var settings = require('../../settings');

var templateInfo = {
  username: '',
  role: ''
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
 * @returns {JWTToken} - json web token for the given user and client id.
 * @function utils.token.generateUser
 */
exports.generateUser = function (username) {
  var info = copyJson(templateInfo);
  info.username = username;
  info.role = 'user';

  return jwt.sign(info, settings.token.secret, settings.token.options);
};
