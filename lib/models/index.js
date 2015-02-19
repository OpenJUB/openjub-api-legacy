'use strict';

/**
* Namespace for all models, merged into one structure.
* @namespace models
*/

module.exports = function (mongoose) {

  var Schema = mongoose.Schema;
  var Models = {};

  Models.Student = require('./student')(mongoose, Schema);
  Models.Course = require('./course')(mongoose, Schema);
  Models.AuthToken = require('./authtoken')(mongoose, Schema);
  Models.PhoneRoom = require('./phoneRoom')(mongoose, Schema);
  Models.Favorites = require('./favorites')(mongoose, Schema);

  return Models;
};
