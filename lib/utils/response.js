'use strict';

/**
* Helper methods in respect to response actions for Express
* @namespace utils.response
*/

var errors = require('../errors');

/**
 * Sends error JSON to the client.
 * @param {Response} res - Response object - see Express.js documentation.
 * @param {string} err - Error to send to client. If not in the {@link errors} namespace, defaults to {@link errors.UnknownError}
 * @function utils.response.senderrorJson
 */
exports.senderrorJson = function (res, err) {
  if (errors[err]) {
    res.status(200).jsonp(errors[err]);
  } else {
    res.status(200).jsonp(errors.UnknownError);
  }
};
