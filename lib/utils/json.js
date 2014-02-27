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
