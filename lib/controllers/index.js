/**
 * controllers/index.js
 *
 * Loads all controllers for easier use in other scripts
 */

'use strict';

module.exports = function () {
  var Controllers = {};

  Controllers.User = require('./user');

  return Controllers;
};
