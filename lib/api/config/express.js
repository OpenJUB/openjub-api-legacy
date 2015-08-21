'use strict';

/**
 * Defines all express related configurations for the server.
 * @namespace config.express
 */

var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var logger = require('morgan');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var modelsImport = require('../../models/');
var settings = require('../../settings');
var responseUtils = require('../../utils/response');

/**
* Configures an instance of express.
* @param {express} app - Instance of express to configure.
* @function config.express.configure
*/
module.exports.configure = function(app) {

  //find the root path.
  var rootPath = path.normalize(__dirname + '/../../..');

  //load mongoose
  mongoose.connect(settings.database);
  var Models = modelsImport;

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

  //how long we cache
  var cacheTime = 60 * 60 * 24 * 1000;

  //serve static content
  app.use(express.static(path.join(rootPath, 'public'), { maxAge: cacheTime }));

  //serve the docs
  app.use('/docs', express.static(path.join(rootPath, 'docs')));
  app.use('/api', express.static(path.join(rootPath, 'api')));

  //serve bower stuff
  app.use('/bower_components', express.static(path.join(rootPath, 'bower_components')));


  //load everything else
  app.use(logger('dev'));
  app.use(bodyParser.urlencoded({
      extended: true
  }));
  app.use(bodyParser.json());
  app.use(methodOverride());
  app.use(cookieParser());
  app.enable('trust proxy');

  //return the root path. 
  return rootPath;
};
