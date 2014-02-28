'use strict';

var jsonUtils = require('../utils/json.js');

exports.get = function (req, res) {
  var params = req.params;

  var results = [];
  // get courses

  if (params.fields) {
    results = results.forEach(function (json) {
      return jsonUtils.filter(json, params.fields);
    });
  }

  res.json({'data': results});
};

exports.getById = function (req, res) {
  //
};
