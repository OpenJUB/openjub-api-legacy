'use strict';

var util = require('util');

/**
* Utility functions for JSON-style objects
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

  //for each key, check if we want it.
  for (var i = 0; i < keys.length; i++) {
    if (json.hasOwnProperty(keys[i])) {
      filtered[keys[i]] = json[keys[i]];
    }
  }

  //and return the new object
  return filtered;
};

/**
* Returns an array containing each JSON-style element only once.
* @param {object[]} data - Array of JSON-style objects to filter.
* @returns {object[]} - New array of objects without doubles.
* @function utils.json.removeJSONDoubles
*/
exports.removeJSONDoubles = function(data){

  var new_data = [];
  var json_data = [];

  var parseElement = function(element){
    //stringify the JSON
    var json = JSON.stringify(element);

    //check if this object is new
    if(json_data.indexOf(json) === -1){

      //if so push it in the values to return
      json_data.push(json);
      new_data.push(element);
    }
  };

  //parse all the elements.
  for(var i=0;i<data.length;i++){
    parseElement(data[i]);
  }

  //return the new elements.
  return new_data;
};

/**
* Creates a new JSON object with the given keys set to 1.
* @param {string[]} [keys = []] - Array of keys to create.
* @returns {object} - New JSON object
* @function utils.json.createFields
*/
exports.createFields = function (keys) {
  keys = keys || [];

  var filter = {};

  //create all the keys.
  for (var i = 0; i < keys.length; i++) {
    filter[keys[i]] = 1;
  }

  //dont add the  ._id element.
  filter._id = 0;

  return filter;
};

/**
* Creates a query object for MongoDB queryies from a string.
* @param {string} [query = ''] - Query to turn into object.
* @returns {object} - Query Object
* @function utils.json.createConditions
*/
exports.createConditions = function (query) {
  //split the query up
  query = query || '';
  query = query.split(',');

  //the conditions we have
  var conditions = {};

  for (var i = 0; i < query.length; i++) {
    // condition can be of 2 forms: field:value or field:/RegEx/
    var cond = query[i].split(':');

    if (cond.length === 2) {
      //it indeed has 2 parts
      if (cond[1][0] === '/' && cond[1][cond[1].length-1] === '/') {
        //it's a regex
        try {
          cond[1] = new RegExp(cond[1].substr(1, cond[1].length-2), 'i');
        } catch (err) {
          // woops, something went wrong.
        }
      }

      //it is not.
      conditions[cond[0]] = cond[1];
    }
  }

  return conditions;
};

/**
* Maps over the keys and values in a JSON-style object.
* @param {object[]} data - Object to map over.
* @param {function} map - Function to map over.
* @returns {object} - Reponse of the map object.
* @function utils.json.mapValue
*/
exports.mapValue = function(data, map){
  var new_data = {};

  for(var key in data){
    //map over all the keys.
    if(data.hasOwnProperty(key)){
      new_data[key] = map(data[key], key, data);
    }
  }

  return new_data;
};

/**
* Ensure an object is a string.
* @param {object} data - Object to check
* @param {object} def - Default to return. May be undefined.
* @returns {string|object} - returned string
* @function utils.json.ensureString
*/
exports.ensureString = function(data, def){
  //if it is a string, we're done already
  if(typeof data === 'string'){
    return data;
  } else if(typeof data !== 'undefined'){
    //if it's not undefined, we can just turn it into a string.
    return data.toString();
  } else {
    //return the default.
    return def;
  }
};


/**
* Ensure an object is a natural number.
* @param {object} data - Object to check
* @param {object} def - Default to return. May be undefined.
* @returns {number|object} - returned non-negative integer
* @function utils.json.ensureNat
*/
exports.ensureNat = function(data, def){

  //if it's undefined, return the default.
  if(typeof data === 'undefined'){
    return def;
  }

  //make it an integer.
  data = parseInt(data);

  //if it is not ffinite, we failed.
  if(!isFinite(data) || data < 0){
    return def;
  }

  //and we are non-negative.
  return data;
};

/**
* Ensure an object is a boolean.
* @param {object} data - Object to check
* @returns {boolean} - returned boolean
* @function utils.json.ensureBool
*/
exports.ensureBool = function(data){
  //typecasting to bool is easy.
  return data?true:false;
};

/**
* Ensure an object is a string array.
* @param {object} data - Object to check
* @param {object} def - Default to return. May be undefined.
* @returns {string[]} - returned string array
* @function utils.json.ensureStringArr
*/
exports.ensureStringArr = function(data, def){
  //if it is a string, split by ,s
  if(typeof data === 'string'){
    return data.split(',');
  } else if(util.isArray(data)){

    //iterate through the array.
    for(var i=0;i<data;i++){
      //make sure this is a string.
      data[i] = exports.ensureString(data[i], false);

      //if not please return.
      if(data[i] === false){
        return def;
      }
    }

    //we can return the array now.
    return data;
  } else {
    //non of the above, return the default.
    return def;
  }
};
