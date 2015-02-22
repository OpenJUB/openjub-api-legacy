'use strict';


var request = require('request');
var settings = require('../../settings');
var jsonUtils = require('../utils/json');
var queryUtils = require('../utils/query');

/**
 * Controllers for users.
 * @namespace controllers.user
 */

 // ================================
 // Helper functions to get results
 // ================================

/** Sends information about a single user by id.
  * @param {request} req - Request object
  * @param {response} res - Response object
  * @param {string} id - Id of user to get
  * @function controller.user.getUserById
  * @private
  */
function getUserById(req, res, fields, id){
  req.models.Student.findOne({'eid': id}, fields).lean()
  .exec(function (err, student) {

    //we have an error
    if (err) {
      res.errorJson('DatabaseProblem');
      return;
    }

    //we need to have a student
    if (!student){
      res.errorJson('UserNotFound');
      return;
    }

    //return the json.
    res
    .status(200)
    .json(student);
  });
}

/** Sends information about a single user by username.
  * @param {request} req - Request object
  * @param {response} res - Response object
  * @param {string} username - Username to find
  * @function controller.user.getUserByName
  * @private
  */
function getUserByName(req, res, fields, username){
  req.models.Student.findOne({'username': username}, fields).lean()
  .exec(function (err, student) {

    //we have an error
    if (err) {
      res.errorJson('DatabaseProblem');
      return;
    }

    //we need to have a student
    if (!student){
      res.errorJson('UserNotFound');
      return;
    }

    //return the json.
    res
    .status(200)
    .json(student);
  });
}

/**
* Executes a number of queries and sends them back to the client.
* @param {string[]} fields - Fields to return
* @param {object[]} queries - A list of queries to execute.
* @param {number} limit - Limit of results.
* @param {number} skip - Skip of results.
* @param {function} cb - Callback to be called with results.
* @function controllers.user.execQueries
* @private
*/
function execQueries(req, fields, queries, limit, skip, cb){
  //TODO: Use this more often.
  //TODO: Can we make this more efficent.
  var results = [];

  var next = function(i){

    //last iteration.
    if(i >= queries.length){
      //Remove doubles from the results.
      results = jsonUtils.removeJSONDoubles(results);
      //and return them.
      return cb(false, results.slice(skip, skip+limit));
    }

    //execute one query at a time.
    req.models.Student.find(queries[i], fields)
    .exec(function(e, s) {
      if(e){
        cb(e, s);
      } else {
        results.push.apply(results, s);
        next(i+1);
      }
    });
  };

  next(0);
}

// ================================
// Getting results
// ================================

/**
* Gets the currently logged in person.
* @param {request} req - Request object
* @param {response} res - Reponse object
* @function controllers.user.me
*/
exports.me = function(req, res){

  //create the fields
  var fields = (req.query.fields) ? req.query.fields.split(',') : null;
  fields = jsonUtils.createFields(fields);

  if(req.user){
    //send a single user
    getUserByName(req, res, fields, req.user);
  } else {
    //we do not exist
    res.errorJson('UserNotFound');
  }
}

/**
* Gets information about a certain person by username.
* @param {request} req - Request object
* @param {response} res - Reponse object
* @function controllers.user.username
*/
exports.username = function(req, res){

  //invalid username
  if(!req.params.username){
    res.errorJson('InvalidRequest');
    return;
  }

  //create the fields
  var fields = (req.query.fields) ? req.query.fields.split(',') : null;
  fields = jsonUtils.createFields(fields);

  //send a single user
  getUserByName(req, res, fields, req.params.username);
}

/**
* Gets information about a certain person by id.
* @param {request} req - Request object
* @param {response} res - Reponse object
* @function controllers.user.id
*/
exports.id = function(req, res){

  //invalid username
  if(!req.params.id){
    res.errorJson('InvalidRequest');
    return;
  }

  //create the fields
  var fields = (req.query.fields) ? req.query.fields.split(',') : null;
  fields = jsonUtils.createFields(fields);

  //send a single user
  getUserById(req, res, fields, req.params.id);
}


/**
* Finds user by a query.
* @param {request} req - Request object
* @param {response} res - Reponse object
* @function controllers.user.query
*/
exports.query = function (req, res) {

  //find the query.
  var query = req.params.q;

  //do we have a query
  if (!query) {
    res.errorJson('InvalidRequest');
    return;
  }

  //parse fields
  var fields = (req.query.fields) ? req.query.fields.split(',') : null;
  fields = jsonUtils.createFields(fields);


  //parse limti and fields.
  var limit = parseInt(query.limit, 0);
  var skip = parseInt(query.skip || 0);

  limit = (isNaN(limit)) ? 25 : limit;

  //build the next url
  if (limit) {
    var url = req.protocol + '://' + req.get('host') + req.path;
    var baseQuery = '?';
    baseQuery += (query.fields) ? ('fields=' + query.fields + '&') : '';
    baseQuery += (query.q) ? ('q=' + query.q + '&') : '';
    var next = url + baseQuery + 'skip=' + (skip+limit) + '&limit=' + limit;
    var prev = (!skip) ? '' : url + baseQuery + 'skip=' + (skip-limit) + '&limit=' + limit;
  }

  //build a search query and do not search for id.
  var searchQuery = queryUtils.parse(query);

  //run the queries.
  execQueries(req, fields, [searchQuery], limit, skip, function(err, students){
    //there was an error
    if (err) {
      res.errorJson('DatabaseProblem');
      return;
    }

    //Here is the reponse.
    var responseJson = {
      'data': students
    };

    //add the next pages.
    if (limit) {
      responseJson.next = next;
      responseJson.prev = prev;
    }

    //and send back the result.
    res
    .status(200)
    .jsonp(responseJson);
  });
};

/**
* Finds user by a query.
* @param {request} req - Request object
* @param {response} res - Reponse object
* @function controllers.user.search
*/
exports.search = function (req, res) {

  //find the query.
  var query = req.params.q;

  //do we have a query
  if (!query) {
    res.errorJson('InvalidRequest');
    return;
  }

  //parse fields
  var fields = (req.query.fields) ? req.query.fields.split(',') : null;

  fields = jsonUtils.createFields(fields);


  //parse limti and fields.
  var limit = parseInt(query.limit, 0);
  var skip = parseInt(query.skip || 0);

  limit = (isNaN(limit)) ? 25 : limit;

  //build the next url
  if (limit) {
    var url = req.protocol + '://' + req.get('host') + req.path;
    var baseQuery = '?';
    baseQuery += (query.fields) ? ('fields=' + query.fields + '&') : '';
    baseQuery += (query.q) ? ('q=' + query.q + '&') : '';
    var next = url + baseQuery + 'skip=' + (skip+limit) + '&limit=' + limit;
    var prev = (!skip) ? '' : url + baseQuery + 'skip=' + (skip-limit) + '&limit=' + limit;
  }



  //not looking for favorites
  var searchQuery = queryUtils.parse(query);

  //Create four dfferent queries
  //we first search at the boundaries
  //and then in general.
  var queryFull = jsonUtils.mapValue(searchQuery, function(v){return new RegExp('(?:^|\\s)'+v+'(?:$|\\s)', 'i');});
  var queryStart = jsonUtils.mapValue(searchQuery, function(v){return new RegExp('(?:^|\\s)'+v, 'i');});
  var queryEnd = jsonUtils.mapValue(searchQuery, function(v){return new RegExp(v+'(?:$|\\s)', 'i');});
  query = jsonUtils.mapValue(searchQuery, function(v){return new RegExp(v, 'i');});

  //run the queries.
  execQueries(req, fields, [queryFull, queryStart, queryEnd, query], limit, skip, function(err, students){
    //there was an error
    if (err) {
      res.errorJson('DatabaseProblem');
      return;
    }

    //Here is the reponse.
    var responseJson = {
      'data': students
    };

    //add the next pages.
    if (limit) {
      responseJson.next = next;
      responseJson.prev = prev;
    }

    //and send back the result.
    res
    .status(200)
    .jsonp(responseJson);
  });
};


// ================================
// Unused
// ================================

/**
* Gets the flag of a country.
* @param {request} req - Request object
* @param {response} res - Reponse object
* @function controllers.user.getCountryFlag
*/
exports.getCountryFlag = function (req, res) {
  request.get(settings.countryBaseUrl + req.params.country + '.png').pipe(res);
};

/**
* Gets the image of a user by eid.
* @param {request} req - Request object
* @param {response} res - Reponse object
* @function controllers.user.getImageByEid
*/
exports.getImageByEid = function (req, res) {
  var eid = req.params.eid;
  request.get(settings.imageBaseUrl + eid).pipe(res);
};

/**
* Gets the image of a user by account name.
* @param {request} req - Request object
* @param {response} res - Reponse object
* @function controllers.user.getImageByAccount
*/
exports.getImageByAccount = function (req, res) {
  var account = req.params.account;

  req.models.Student.findOne({'username': account}).lean()
  .exec(function (err, student) {

    //find the eid.
    if (err || !student) {
      res.errorJson('UserNotFound');
    }

    //and pipe the image.
    request.get(settings.imageBaseUrl + student.eid).pipe(res);
  });
};
