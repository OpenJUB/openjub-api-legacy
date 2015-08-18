'use strict';

/**
* Helper methods in respect to response actions for Express
* @namespace utils.response
*/

var errors = require('../api/errors');

/**
 * Sends error JSON to the client.
 * @param {Response} res - Response object - see Express.js documentation.
 * @param {string} err - Error to send to client. If not in the {@link errors} namespace, defaults to {@link errors.UnknownError}
 * @function utils.response.senderrorJson
 */
exports.senderrorJson = function (res, err) {

  //resolve the error
  err = errors[err];

  //if we don't know the error
  if (!err) {
    err = errors.UnknownError;
  }

  //send the right status
  res.status(err[0]).jsonp(err[1]);
};
