'use strict';

var url = require("url");
var request = require('request');
var query = require("./query");
var settings = require('../../../settings');
var models = require('../../../db/models');
var jsonUtils = require('../../../utils/json');
var queryUtils = require('../../../utils/query');

/**
 * Controllers for users.
 * @namespace controllers.user
 */

var makePreSuf = function(req){
  req.prefix = req.protocol + '://' + req.get('host');
  req.suffix = '?token='+req.token;

  return req;
};

var findOneUser = function(req, res, uQuery){
  req = makePreSuf(req);

  query.queryOne(uQuery, req, res, req.query.fields || "", function(err, user){
    if(err){
      res.errorJson("DatabaseProblem");
    } else if(user === null){
      res.errorJson('UserNotFound');
    } else {
      res
      .status(200)
      .jsonp(user);
    }
  });
};

var findMoreUsers = function(req, res, uQueries){
  req = makePreSuf(req);

  // parse limit and skip
  var limit = jsonUtils.ensureNat(req.query.limit, 25);
  var skip = jsonUtils.ensureNat(req.query.skip, 0);

  // get the previous and next skips
  var nextSkip = skip + limit;
  var prevSkip = skip - limit;

  // parse the URL
  var parsedURL = url.parse(req.prefix+req.originalUrl, true);
  delete parsedURL.search;

  // and make a next query
  parsedURL.query.skip = nextSkip;
  var nextURL = url.format(parsedURL);


  // and a previous query
  parsedURL.query.skip = prevSkip;
  var prevURL = url.format(parsedURL);

  // and make the query.
  query.queryJoin(uQueries, skip, limit, req.query.fields  || "", req, res,  function(err, users, count){
    if(err){
      res.errorJson("DatabaseProblem");
    } else {
      res
      .status(200)
      .jsonp({
        // the actual results
        "data": users,

        // the number of results we have in total
        "count": count,

        // the next and previous count
        "next": nextSkip<=count?nextURL:false,
        "prev": prevSkip>=0?prevURL:false
      });
    }
  });
};

/**
* Gets the currently logged in person.
* @param {request} req - Request object
* @param {response} res - Reponse object
* @function controllers.user.me
*/
exports.me = function(req, res){
  if(req.user){
    findOneUser(req, res, {"username": req.user});
  } else {
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
  if(req.params.username){
    findOneUser(req, res, {"username": req.params.username});
  } else {
    res.errorJson('InvalidRequest');
  }
};

/**
* Gets information about a certain person by id.
* @param {request} req - Request object
* @param {response} res - Reponse object
* @function controllers.user.id
*/
exports.id = function(req, res){
  if(req.params.id){
    findOneUser(req, res, {"eid": req.params.id});
  } else {
    res.errorJson('InvalidRequest');
  }
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

  //build a search query and do not search for id.
  findMoreUsers(req, res, [queryUtils.parseStrict(query)]);
};

/**
* Finds all users.
* @param {request} req - Request object
* @param {response} res - Reponse object
* @function controllers.user.query
*/
exports.all = function (req, res) {
  findMoreUsers(req, res, [{}]);
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
  var fields = req.query.fields;

  //parse limit and fields.
  var limit = jsonUtils.ensureNat(req.query.limit, 25);
  var skip = jsonUtils.ensureNat(req.query.skip, 0);

  // build a search query
  findMoreUsers(req, res, queryUtils.parse(query));
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
  models.Student.findOne({'username': account}, {'eid': 1}).lean()
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
