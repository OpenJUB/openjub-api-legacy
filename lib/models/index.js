'use strict';

var mongoose = require('mongoose');
var settings = require('./../../settings');

module.exports = function (cb) {
  mongoose.connect(settings.database);

  var Schema = mongoose.Schema;
  var Models = {};

  Models.Student = require('./student')(mongoose, Schema);

  return cb(Models);
};
