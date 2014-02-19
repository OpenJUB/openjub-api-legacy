'use strict';

module.exports = function (mongoose, cb) {

  var Schema = mongoose.Schema;
  var Models = {};

  Models.Student = require('./student')(mongoose, Schema);

  return cb(Models);
};
