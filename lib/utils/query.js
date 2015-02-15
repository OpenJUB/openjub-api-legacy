'use strict';

/**
* Utility functions for Querying.
* @namespace utils.query
*/

var
allFields = ['firstName','lastName','major','majorShort','email','phone','room','college','country','year','status','username']; //all possible fields


//build some Regexes
var noQuoteQuery = new RegExp('('+allFields.join('|')+'):\\s?([^\\s\\"\\\']+)', 'gi');
var singleQuoteQuery = new RegExp('('+allFields.join('|')+'):\\s?\'([^\']+)\'', 'gi');
var doubleQuoteQuery = new RegExp('('+allFields.join('|')+'):\\s?"([^"]+)"', 'gi');

//some more Regexes
var yearRegEx = new RegExp('\\b(\\d{2})\\b', 'gi');
var phoneRegEx = new RegExp('\\b(?:(?:00)?\\s?49\\s*)?(?:\\s*200)?\\s*(\\d{4})\\b', 'gi');

/**
 * Escapes a string for use with a Regular expression.
 * from: https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
 * @param {string} str - String to escape
 * @returns {string} - The escaped string.
 * @function utils.query.escapeRegExp
 * @private
 */
function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

/**
 * Escapes a full Name for use within a query.
 * @param {string} fullName - Name to escape.
 * @returns {string} - A regex for a full name match.
 * @function utils.query.escapeFullName
 * @private
 */
function escapeFullName(fullName){
  //split the name by (multiple) spaces
  var names = fullName.replace('\\s+',' ').split(' ');

  //check for names attached with -s
  names = names.map(function(e){
      return '(\\w+\\-)?'+e+'(\\-\\w+)?';
    });

  //and return the entire regex.
  return names.join(' ([\\w]+ )*');
}

/**
 * Parses a string into a query object.
 * @param {string} query - Query to parse.
 * @returns {object} - A query object.
 * @function utils.query.parse
 */
exports.parse = function (query) {
  query = query || '';
  var result = null;
  var conditions = {};

  //find the full name query by just replaceing everything.
  var fullNameQuery = query
  .replace(noQuoteQuery, '')
  .replace(singleQuoteQuery, '')
  .replace(doubleQuoteQuery, '')
  .trim();

  //go over the phone
  result = phoneRegEx.exec(query);
  while (result !== null) {
    conditions.phone = '^'+result[1]+'$';
    result = phoneRegEx.exec(query);
  }

  //replace the phone
  fullNameQuery = fullNameQuery.replace(phoneRegEx, '').trim();


  //go over the years
  result = yearRegEx.exec(query);
  while (result !== null) {
    conditions.year = result[1]+'$';
    result = yearRegEx.exec(query);
  }

  //replace the years
  fullNameQuery = fullNameQuery.replace(yearRegEx, '').trim();

  //iterate over the noQuote Results
  result = noQuoteQuery.exec(query);
  while (result !== null) {
    conditions[result[1]] = escapeRegExp(result[2]).replace(', ', ',').split(',').join('|');
    result = noQuoteQuery.exec(query);
  }

  //go over single quotes => these just search with spaces.
  result = singleQuoteQuery.exec(query);
  while (result !== null) {
    conditions[result[1]] = escapeRegExp(result[2]).replace(', ', ',').split(',').join('|');
    result = singleQuoteQuery.exec(query);
  }

  //go over double quotes => these just search exact matches (without case).
  result = doubleQuoteQuery.exec(query);
  while (result !== null) {
    conditions[result[1]] = '^'+escapeRegExp(result[2]).replace(', ', ',').split(',').join('|')+'$';
    result = doubleQuoteQuery.exec(query);
  }

  //ok, now for the sp

  if(fullNameQuery.trim() !== ''){
    //go over the full name if its on-empty
    conditions.fullName = escapeFullName(fullNameQuery);
  }

  //console.log(conditions);
  return conditions;
};
