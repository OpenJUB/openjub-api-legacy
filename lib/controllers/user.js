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
   * @param {object} user - User to clean up.
   * @param {request} req - Request object
   * @param {object} fields - Fields to get.
   * @function controller.user.cleanUser
   * @private
   */
function cleanUser(user, req, fields){
  //make sure the user is writable.
  var user = JSON.parse(JSON.stringify(user));

  if(jsonUtils.containsField(fields, 'flag')){
    //prepend the server name.
    user.flag = req.protocol + '://' + req.get('host') + user.flag;
  }

  if(jsonUtils.containsField(fields, 'picture')){
    //prepend the server name.
    user.picture = req.protocol + '://' + req.get('host') + user.picture;
    //append the other thing.
    user.picture += '?token='+req.token;
  }

  if(jsonUtils.containsField(fields, 'year')){
    //if the year is not long enough, prepend a zero.
    if(user.year.length < 2){
      user.year = '0'+user.year;
    }
  }

  //delete the id property
  delete user['id'];

  return user;
}


/** Sends information about a single user by id.
  * @param {request} req - Request object
  * @param {response} res - Response object
  * @param {string} id - Id of user to get
  * @function controller.user.getUserById
  * @private
  */
function getUserById(req, res, fields, id){
  req.models.Student.findOne({'eid': id}, fields)
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

    //cleanup the user.
    student = cleanUser(student, req, fields);

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
  req.models.Student.findOne({'username': username}, fields)
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

    //cleanup the user.
    student = cleanUser(student, req, fields);

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
  var results = [];

  var next = function(i){
    //last iteration.
    if(i >= queries.length){
      //Remove doubles from the results.
      results = jsonUtils.removeJSONDoubles(results);

      //and take the right range.
      results = results.slice(skip, skip+limit);

      //cleanup all the users.
      for(var j=0;j<results.length;j++){
        results[j] = cleanUser(results[j], req, fields);
      }

      //and return them.
      return cb(false, results);
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
  var fields = jsonUtils.createFields(jsonUtils.ensureStringArr(req.query.fields, []));

  if(req.user){
    //send a single user
    getUserByName(req, res, fields, req.user);
  } else {
    //we do not exist
    res.errorJson('UserNotFound');
  }
};

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
  var fields = jsonUtils.createFields(jsonUtils.ensureStringArr(req.query.fields, []));

  //send a single user
  getUserByName(req, res, fields, jsonUtils.ensureString(req.params.username, ''));
};

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
  var fields = jsonUtils.createFields(jsonUtils.ensureStringArr(req.query.fields, []));

  //send a single user
  getUserById(req, res, fields, jsonUtils.ensureString(req.params.id, ''));
};


/**
* Finds user by a query.
* @param {request} req - Request object
* @param {response} res - Reponse object
* @function controllers.user.query
*/
exports.query = function (req, res) {

  //parse the query.
  var query = jsonUtils.ensureString(req.params.q, '');

  //do we have a query
  if (!query) {
    res.errorJson('InvalidRequest');
    return;
  }

  //create the fields
  var fields = jsonUtils.createFields(jsonUtils.ensureStringArr(req.query.fields, []));

  //parse limit and fields.
  var limit = jsonUtils.ensureNat(req.query.limit, 25);
  var skip = jsonUtils.ensureNat(req.query.skip, 0);

  //build the next url
  if (limit !== 0) {
    var url = req.protocol + '://' + req.get('host') + req.path;
    var baseQuery = '?';
    baseQuery += (fields) ? ('fields=' + jsonUtils.ensureStringArr(req.query.fields, []).join(',') + '&') : '';
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
    if (limit !== 0) {
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

  //parse the query.
  var query = jsonUtils.ensureString(req.params.q, '');

  //do we have a query
  if (!query) {
    res.errorJson('InvalidRequest');
    return;
  }

  //create the fields
  var fields = jsonUtils.createFields(jsonUtils.ensureStringArr(req.query.fields, []));

  //parse limit and fields.
  var limit = jsonUtils.ensureNat(req.query.limit, 25);
  var skip = jsonUtils.ensureNat(req.query.skip, 0);

  //build the next url
  if (limit !== 0) {
    var url = req.protocol + '://' + req.get('host') + req.path;
    var baseQuery = '?';
    baseQuery += (fields) ? ('fields=' + jsonUtils.ensureStringArr(req.query.fields, []).join(',') + '&') : '';
    var next = url + baseQuery + 'skip=' + (skip+limit) + '&limit=' + limit;
    var prev = (!skip) ? '' : url + baseQuery + 'skip=' + (skip-limit) + '&limit=' + limit;
  }

  //build a search query and do not search for id.
  var searchQuery = queryUtils.parse(query);

  //Create four dfferent queries
  //we first search at the boundaries
  //and then in general.
  var queryFull = jsonUtils.mapValue(searchQuery, function(v){return new RegExp('(?:^|\\s)'+v+'(?:$|\\s)', 'i');});
  var queryStart = jsonUtils.mapValue(searchQuery, function(v){return new RegExp('(?:^|\\s)'+v, 'i');});
  var queryEnd = jsonUtils.mapValue(searchQuery, function(v){return new RegExp(v+'(?:$|\\s)', 'i');});
  searchQuery = jsonUtils.mapValue(searchQuery, function(v){return new RegExp(v, 'i');});

  //run the queries.
  execQueries(req, fields, [queryFull, queryStart, queryEnd, searchQuery], limit, skip, function(err, students){
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
    if (limit !== 0) {
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
* Gets the image of a user by account name.
* @param {request} req - Request object
* @param {response} res - Reponse object
* @function controllers.user.image
*/
exports.image = function (req, res) {
  var account = jsonUtils.ensureString(req.params.account, '');

  //the account isnt there
  if(!account){
    res.errorJson('InvalidRequest');
    return;
  }

  //search for eid only
  req.models.Student.findOne({'username': account}, {'eid': 1}).lean()
  .exec(function (err, student) {

    //find the eid.
    if (err || !student) {
      res.errorJson('UserNotFound');
      return;
    }

    //and pipe the image.
    request.get(settings.imageBaseUrl + student.eid).pipe(res);
  });
};
