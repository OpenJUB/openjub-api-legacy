'use strict';

var mongoose = require('mongoose');

/**
* Namespace for all models, merged into one structure.
* @namespace models
*/
module.exports.Session = require('./session')(mongoose, mongoose.Schema);
module.exports.Student = require('./student')(mongoose, mongoose.Schema);
