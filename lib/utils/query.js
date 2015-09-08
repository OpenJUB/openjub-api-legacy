// dependencies
var Parser = require('./Parser');
var studentModel = require('../studentModel');

// all the fields
var allFields = studentModel.completionKeys;
var completions = studentModel.completions;

// build a list of completion RegExes
var completionRegs = (function(){
  var field, completion;
  var completionRegs = [];

  for(var i=0;i<allFields.length;i++){
    field = allFields[i];
    completion = completions[field];

    if(completion instanceof RegExp){
      completionRegs.push([completion, field]);
    }
  }

  return completionRegs;
})();

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

var parseStrict = module.exports.parseStrict = function parseStrict(query){
  if(typeof query === 'string'){
    // parse thq query into strings and key-value terms
    var parsedQuery = Parser.parse(query);
  } else {
    parsedQuery = query;
  }

  var kvTerms = parsedQuery.data;

  // the basic query.
  var baseQuery = {};

  var kvTerm;

  // create basic queries for the fields
  allFields.map(function(e, idx){
    if(kvTerms.hasOwnProperty(e)){
      kvTerm = kvTerms[e]
      baseQuery[e] = kvTerm.map(function(q){
        if(typeof q === 'string'){
          return new RegExp(escapeRegExp(q));
        } else {
          return q;
        }
      });
    }
  });

  return joinAndOptimiseQueries(baseQuery);
};

/**
 * Joins and optimises queries after it was initially constructed.
 */
function joinAndOptimiseQueries(){

  // first of all look into the query.
  var _query = {};

  // first of all
  var queries = Array.prototype.slice.call(arguments);
  var query;

  // go over the queries
  for(var i=0;i<queries.length;i++){
    query = queries[i];

    // if we have an or, we want to add the or to the rest of the query.
    if(query.hasOwnProperty('$or')){
        queries = queries.concat(query['$or']);
        delete query['$or'];
        i--;
        continue;
    }

    // add all the keys to the array.
    for(var key in query){
      if(query.hasOwnProperty(key)){
        _query[key] = (_query[key] || []).concat(query[key])
      }
    }
  }

  var prop;

  for(var key in _query){
    if(_query.hasOwnProperty(key)){
      prop = _query[key];
      prop = prop.filter(function(e, i){return prop.indexOf(e) === i; })

      if(prop.length === 0){
        delete _query[key];
      } else if(prop.length === 1){
        _query[key] = prop[0];
      } else {
        _query[key] = {'$or': prop};
      }
    }
  }

  return _query;
}

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
 * Parses a string query into a mongodb query for the database.
 */
var parse = module.exports.parse = function parse(query){

  // parse thq query into strings and key-value terms
  var parsedQuery = Parser.parse(query);
  var baseQuery = parseStrict(parsedQuery);

  // extract strings and data from it.
  var srTerms = parsedQuery.search;

  // get strings and regexes seperate
  var sTerms = srTerms.filter(function(e, idx){return typeof e === 'string';});
  var rTerms = srTerms.filter(function(e, idx){return e instanceof RegExp;});

  // we add the regexes to the full name
  // so that we can match it.
  baseQuery['fullName'] = (baseQuery['fullName'] || []).concat(rTerms);

  // we check the normal strings for the given regexes
  completionRegs.map(function(e, idx){
    var re = e[0];
    var n = e[1];
    var m;

    for(var i=0;i<sTerms.length;i++){
      m = sTerms[i].match(re);
      if(m){
        // remove the string because it has been matched
        sTerms.splice(i);

        // extend the base query or create it
        baseQuery[n] = (baseQuery[n] || []).concat([m[1] || m[0]]);
      }
    }
  });

  var s;
  var nc = [];

  // finally we need to match strings still.
  for(var i=0;i<sTerms.length;i++){
    s = sTerms[i];

    // if it contains a space, i. e. if it was quoted
    if(s.match(/\s/)){
      baseQuery['fullName'].push(s);
    } else {
      // add the name components
      nc.push(s);
    }
  }

  if(nc.length > 0){
    // take the query
    var escapeQuery = escapeFullName(nc.join(' '));

    // and add it for the four places
    var queryFull = new RegExp('(?:^|\\s)'+escapeQuery+'(?:$|\\s)', 'i');
    var queryStart = new RegExp('(?:^|\\s)'+escapeQuery, 'i');
    var queryEnd = new RegExp(escapeQuery+'(?:$|\\s)', 'i');
    var queryNormal = new RegExp(escapeQuery, 'i');

    var builtQuery = [
      joinAndOptimiseQueries({'fullName': queryFull}, baseQuery),
      joinAndOptimiseQueries({'fullName': queryStart}, baseQuery),
      joinAndOptimiseQueries({'fullName': queryEnd}, baseQuery),
      joinAndOptimiseQueries({'fullName': queryNormal}, baseQuery)
    ];

    return builtQuery;
  } else {
    // we have only the base query.
    return [joinAndOptimiseQueries(baseQuery)];
  }
};
