'use strict';

/**
 * Namespace containing all controllers.
 * @namespace controllers
 */

module.exports = function () {
  var Controllers = {};

  Controllers.User = require('./user');
  Controllers.Course = require('./course');
  Controllers.Auth = require('./auth');

  return Controllers;
};
