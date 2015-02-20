'use strict';

/**
 * Defines all express related configurations for the server.
 * @namespace config.express
 */

var express = require('express');
var path = require('path');
var modelsImport = require('../models/');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var settings = require('../../settings');
var responseUtils = require('../utils/response');

/**
* Configures an instance of express.
* @param {express} app - Instance of express to configure.
* @function config.express.configure
*/
module.exports.configure = function(app) {

  //find the root path.
  var rootPath = path.normalize(__dirname + '/../..');

  //load mongoose
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
      responseUtils.senderrorJson(res, err);
    };
    return next();
  });

  //error handler for DEBUG
  app.configure('development', function(){
    app.use(require('connect-livereload')());
    app.use(express.errorHandler());
  });

  app.configure(function(){

    //serve static content
    app.use(express.static(path.join(rootPath, 'public')));

    //serve the docs
    app.use('/docs', express.static(path.join(rootPath, 'docs')));
    app.use('/api', express.static(path.join(rootPath, 'api')));

    //load everything else
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.cookieSession({
      "secret": settings.token.secret,
      "name": "openjub_session"
    }));
    app.enable('trust proxy');

    //and route things
    app.use(app.router);
  });
};
