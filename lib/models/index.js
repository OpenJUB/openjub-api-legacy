/**
 * models/index.js
 *
 * Includes all models and merges them into one JSON
 */

'use strict';

module.exports = function (mongoose) {

  var Schema = mongoose.Schema;
  var Models = {};

  Models.Student = require('./student')(mongoose, Schema);
  Models.Course = require('./course')(mongoose, Schema);

  return Models;
};
