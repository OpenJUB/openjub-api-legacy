/**
 * models/index.js
 *
 * Includes all models and merges them into one JSON
 */

'use strict';

module.exports = function (mongoose, cb) {

  var Schema = mongoose.Schema;
  var Models = {};

  Models.Student = require('./student')(mongoose, Schema);

  return Models;
};
