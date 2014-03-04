'use strict';

exports.filter = function (json, keys) {
  var filtered = {};
  for (var i = 0; i < keys.length; i++) {
    if (json.hasOwnProperty(keys[i])) {
      filtered[keys[i]] = json[keys[i]];
    }
  }
  return filtered;
};

exports.createFields = function (keys) {
  keys = keys || [];

  var filter = {};

  for (var i = 0; i < keys.length; i++) {
    filter[keys[i]] = 1;
  }

  filter._id = 0;
  // filter.__v = 0;

  return filter;
};

exports.createConditions = function (query) {
  query = query || '';
  query = query.split(',');

  var conditions = {};

  for (var i = 0; i < query.length; i++) {
    var cond = query[i].split(':');
    if (cond.length === 2) {
      if (cond[1][0] === '/' && cond[1][cond[1].length-1] === '/') {
        try {
          cond[1] = new RegExp(cond[1].substr(1, cond[1].length-2), 'i');
        } catch (err) {
          //
        }
      }
      conditions[cond[0]] = cond[1];
    }
  }

  return conditions;
};
