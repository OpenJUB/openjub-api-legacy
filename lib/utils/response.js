/**
 * utils/response.js
 *
 * Helper methods in respect to response actions for Express
 */

'use strict';

var errors = require('../errors');

exports.sendErrorJson = function (res, err) {
  if (errors[err]) {
    res.json.apply(res, errors[err]);
  } else {
    res.json.apply(res, errors.UnknownError);
  }
};
