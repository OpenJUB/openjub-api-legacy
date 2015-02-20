'use strict';

/**
* Namespace for all models, merged into one structure.
* @namespace models
*/

module.exports = function (mongoose) {

  var Schema = mongoose.Schema;
  var Models = {};

  Models.Session = require('./session')(mongoose, Schema);
  Models.Student = require('./student')(mongoose, Schema);
  Models.Course = require('./course')(mongoose, Schema);
  Models.PhoneRoom = require('./phoneRoom')(mongoose, Schema);
  Models.Favorites = require('./favorites')(mongoose, Schema);

  return Models;
};
