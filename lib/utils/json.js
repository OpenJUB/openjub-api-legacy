'use strict';

/**
* JSON utility functions.
* @namespace utils.json
*/

/**
* Filters a JSON-style object and returns an object containing only the given keys.
* @param {object} json - Object to filter keys from.
* @param {string[]} keys - Keys to return.
* @returns {object} - Filtered object. 
* @function utils.json.filter
*/
exports.filter = function (json, keys) {
  var filtered = {};
  for (var i = 0; i < keys.length; i++) {
    if (json.hasOwnProperty(keys[i])) {
      filtered[keys[i]] = json[keys[i]];
    }
  }
  return filtered;
};

exports.removeJSONDoubles = function(data){

  var new_data = [];
  var json_data = [];

  var parseElement = function(element){
    var json = JSON.stringify(element);

    if(json_data.indexOf(json) === -1){
      json_data.push(json);
      new_data.push(element);
    }
  };

  for(var i=0;i<data.length;i++){
    parseElement(data[i]);
  }

  return new_data;
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

exports.map_value = function(data, map){
  var new_data = {};

  for(var key in data){
    if(data.hasOwnProperty(key)){

      new_data[key] = map(data[key], key, data);
    }
  }

  return new_data;
};
