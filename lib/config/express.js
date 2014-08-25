/**
 * config/express.js
 *
 * Defines all express related configurations for the server
 */

'use strict';

var express = require('express');
var path = require('path');
// var jwt = require('express-jwt');
var modelsImport = require('../models/');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var settings = require('../../settings');
var responseUtils = require('../utils/response');

module.exports = function(app) {
  var rootPath = path.normalize(__dirname + '/../..');

  mongoose.connect(settings.database);

  var Models = modelsImport(mongoose);

  // make models available in req variable
  app.use(function (req, res, next) {
    req.models = Models;
    return next();
  });

  // make error message function available in res variable
  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');

    res.errorJson = function (err) {
      responseUtils.sendErrorJson(res, err);
    };
    return next();
  });

  app.configure('development', function(){
    app.use(require('connect-livereload')());


    app.use(express.errorHandler());
  });

  app.configure(function(){
    app.set('views', path.join(rootPath, 'views'));
    app.use(express.static(path.join(rootPath, 'public')));
    app.use('/docs', express.static(path.join(rootPath, 'docs')));
    // app.engine('ejs', engine);
    app.set('view engine', 'ejs');
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(cookieParser());

    // Router needs to be last
    app.use(app.router);
  });
};
