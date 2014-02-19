'use strict';

var express = require('express');
var path = require('path');
var modelsImport = require('../models/');
var mongoose = require('mongoose');
var settings = require('../../settings');
var responseUtils = require('../utils/response');

module.exports = function(app) {
  var rootPath = path.normalize(__dirname + '/../..');

  mongoose.connect(settings.database);

  var Models;
  modelsImport(mongoose, function (models) {
    Models = models;
  });

  // make models available in req variable
  app.use(function (req, res, next) {
    req.models = Models;
    return next();
  });

  // make error message function available in res variable
  app.use(function (req, res, next) {
    res.errorJson = function (err) {
      responseUtils.sendErrorJson(res, err);
    };
    return next();
  });

  app.configure('development', function(){
    app.use(require('connect-livereload')());


    app.use(express.errorHandler());
    app.set('views', rootPath + '/app/views');
  });

  app.configure(function(){
    app.use('/docs', express.static(path.join(rootPath, 'docs')));
    // app.engine('ejs', engine);
    // app.set('view engine', 'ejs');
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());

    // Router needs to be last
    app.use(app.router);
  });
};
