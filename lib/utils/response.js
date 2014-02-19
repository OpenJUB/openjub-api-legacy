'use strict';

var errors = require('../errors');

exports.sendErrorJson = function (res, err) {
  if (errors[err]) {
    res.json.apply(res, errors[err]);
  } else {
    res.json.apply(res, errors.UnknownError);
  }
};
