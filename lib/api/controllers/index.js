'use strict';

/**
 * Namespace containing all controllers.
 * @namespace controllers
 */

module.exports = function () {
  var Controllers = {};

  Controllers.Session = require('./session');
  Controllers.Auth = require('./auth');
  Controllers.User = require('./user');
  /*

  Controllers.Course = require('./course');
  */
  return Controllers;
};
