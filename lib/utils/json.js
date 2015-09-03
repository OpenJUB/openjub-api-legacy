'use strict';

var util = require('util');

/**
* Utility functions for JSON-style objects
* @namespace utils.json
*/

/**
* Returns an array containing each JSON-style element only once.
* @param {object[]} data - Array of JSON-style objects to filter.
* @param {function} [hash] - Optional function to has objects with.
* @returns {object[]} - New array of objects without doubles.
* @function utils.json.removeJSONDoubles
*/
exports.removeJSONDoubles = function(data, hash){

  var new_data = [];
  var json_data = [];

  // if we do not have a hash
  // use the JSON version.
  if(typeof hash !== 'function'){
    hash = function(obj){
      return JSON.stringify(obj);
    };
  }


  var parseElement = function(element){
    //stringify the JSON
    var json = hash(element);

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
* Sorts two array by where the elements are contained: In one of the arrays or in both.
* @param {object[]} dataA - Data Array A to use.
* @param {string[]|function} keysA - Keys matching array A.
* @param {object[]} dataB - Data Array B to use.
* @param {string[]|function} keysB - Keys matching array B.
* @param {string[][]} - Triple Containing sorted data.
* @function utils.json.diffKey
*/
exports.diffKey = function(dataA, keysA, dataB, keysB){
  
  if(typeof keysA === 'function'){
    keysA = dataA.map(keysA);
  }

  if(typeof keysB === 'function'){
    keysB = dataB.map(keysB);
  }

  var onlyA = [];
  var onlyB = [];
  var both = [];

  for(var i=0;i<keysA.length;i++){
    // if it is not contained in B, it is only in A
    if(keysB.indexOf(keysA[i]) === -1){
      onlyA.push(dataA[i]);

    // else it is in both.
    } else {
      both.push(dataA[i]);
    }
  }

  for(var i=0;i<keysB.length;i++){
    // if it is not contained in B, it is only in A
    if(keysA.indexOf(keysB[i]) === -1){
      onlyB.push(dataB[i]);
    }
    // else it is in both, but we have done that already.
  }

  return [
    onlyA,
    onlyB,
    both
  ]
};
