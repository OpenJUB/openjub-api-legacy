'use strict';

/**
* Defines all middleware used by Express.
* @namespace middleware
*/

var jwt = require('jsonwebtoken');
var settings = require('../settings');

/**
* Checks if a user is authenticated.
* @param {request} req - Request object
* @param {result} res - Result object
* @param {function} next - Next thing to do.
* @function middleware.needAuth
*/
exports.needAuth = function (req, res, next) {

};
