'use strict';


var request = require('request');
var settings = require('../../settings');
var jsonUtils = require('../utils/json');
var queryUtils = require('../utils/query');

/**
 * Controllers for users.
 * @namespace controllers.user
 */

 /**
 * Finds a number of students by an exact query.
 * @param {request} req - Request object
 * @param {response} res - Result object
 * @function controllers.user.get
 */
exports.get = function (req, res) {
  //find the query and parse it.
  var query = req.query;
  var conditions = jsonUtils.createConditions(query.q);

  //Create the fields as well
  var fields = (query.fields) ? query.fields.split(',') : null;
  fields = jsonUtils.createFields(fields);

  //find the next page to render.
  //TODO: Add a pagination helper.
  var limit = parseInt(query.limit, 0);
  var skip = parseInt(query.skip || 0);

  //if we have pagination
  if (limit) {
    var url = req.protocol + '://' + req.get('host') + req.path;
    var baseQuery = '?';
    baseQuery += (query.fields) ? ('fields=' + query.fields + '&') : '';
    baseQuery += (query.q) ? ('q=' + query.q + '&') : '';
    var next = url + baseQuery + 'skip=' + (skip+limit) + '&limit=' + limit;
    var prev = (!skip) ? '' : url + baseQuery + 'skip=' + (skip-limit) + '&limit=' + limit;
  }

  //search the database
  req.models.Student.find(conditions, fields).limit(limit).skip(skip).lean()
  .exec(function (err, students) {

    //we could not find it.
    if (err) {
      res.errorJson('DatabaseProblem');
      return;
    }

    //we have the data now.
    var responseJson = {
      'data': students
    };

    //add the pages.
    if (limit) {
      responseJson.next = next;
      responseJson.prev = prev;
    }

    //and return it
    res.json(responseJson);
  });
};

/**
* Gets a single user by its id.
* @param {request} req - Request object
* @param {response} res - Result object
* @function controllers.user.getById
*/
exports.getById = function (req, res) {

  var eid = req.params.eid;

  //which fields?
  var fields = req.query.fields;

  fields = (fields) ? fields.split(',') : null;
  fields = jsonUtils.createFields(fields);

  //was there and invalid request?
  if (!eid) {
    res.errorJson('InvalidRequest');
  }

  //find this student by eid.
  req.models.Student.findOne({'eid': eid}, fields).lean()
  .exec(function (err, student) {

    //we have an error
    if (err) {
      res.errorJson('DatabaseProblem');
      return;
    }

    //return the json.
    res.json(student);
  });
};

/**
* Gets a single user by its username.
* @param {request} req - Request object
* @param {response} res - Result object
* @function controllers.user.getByAccount
*/
exports.getByAccount = function (req, res) {

  //which account do we want.
  var account = req.params.account;

  //parse the fields
  var fields = req.query.fields;
  fields = (fields) ? fields.split(',') : null;
  fields = jsonUtils.createFields(fields);

  //woops
  if (!account) {
    res.errorJson('InvalidRequest');
    return;
  }

  //find a single student
  req.models.Student.findOne({'username': account}, fields).lean()
  .exec(function (err, student) {

    //we could not connect to the databse.
    if (err) {
      res.errorJson('DatabaseProblem');
      return;
    }
    res.json(student);
    return;
  });
};

/**
* Gets the currently looged in person.
* @param {request} req - Request object
* @param {response} res - Result object
* @function controllers.user.me
*/
exports.me = function (req, res) {
  //find the account name.
  var account = req.access.username;

  //get the fields.
  var fields = req.query.fields;
  fields = (fields) ? fields.split(',') : null;
  fields = jsonUtils.createFields(fields);

  if (!account) {
    //we are not logged in.
    res.errorJson('InvalidRequest');
    return;
  }

  req.models.Student.findOne({'username': account}, fields).lean()
  .exec(function (err, student) {

    //databse problems.
    if (err) {
      res.errorJson('DatabaseProblem');
      return;
    }

    //for jpeople, also devliver favorites
    //TODO: un hardcode this, have a seperate route for favorites.
    if (false /*req.access.client_id === 'jpeople'*/) {

      //find the favorites also.
      req.models.Favorites.findOne({'user': account}).lean().exec(function (err, favs) {
        if (err) {
          res.errorJson('DatabaseProblem');
          return;
        }
        if (!favs) {
          student.favorites = [];
        } else {
          student.favorites = favs.favorites;
        }
        res.json(student);
        return;
      });

    } else {

      //otherwise just return it.
      res.json(student);
      return;
    }
  });
};

/**
* Gets the flag of a country.
* @param {request} req - Request object
* @param {response} res - Result object
* @function controllers.user.getCountryFlag
*/
exports.getCountryFlag = function (req, res) {
  request.get(settings.countryBaseUrl + req.params.country + '.png').pipe(res);
};

/**
* Gets the image of a user by eid.
* @param {request} req - Request object
* @param {response} res - Result object
* @function controllers.user.getImageByEid
*/
exports.getImageByEid = function (req, res) {
  var eid = req.params.eid;
  request.get(settings.imageBaseUrl + eid).pipe(res);
};

/**
* Gets the image of a user by account name.
* @param {request} req - Request object
* @param {response} res - Result object
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

/**
* Finds users with the autocomplete scheme.
* @param {request} req - Request object
* @param {response} res - Result object
* @param {function} next_ - The next action to run.
* @function controllers.user.autocomplete
*/
exports.autocomplete = function (req, res, next_) {

  //find the query.
  var query = req.query;

  //do we have a query
  if (!query.q) {
    res.errorJson('InvalidRequest');
    return;
  }

  //get the right fields
  var fields = (query.fields) ? query.fields.split(',') : null;
  fields = jsonUtils.createFields(fields);

  //parse the limit and the beginning
  //TODO: Use a helper function for this.
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

  if (query.q.toLowerCase() === 'favorites' && req.access && req.access.role === 'user') {
    //we are searching for favorites
    var user = req.access.username;
    req.models.Favorites.findOne({'user': user}).lean().exec(function (err, fav) {
      //we could not connect.
      if (err) {
        res.errorJson('DatabaseProblem');
        return;
      }

      //we  do not have favorites (yet?)
      if (!fav) {
        res.json({'data': []});
        return;
      }
      //find the favorites.
      //TODO: Use a seperate function for this.
      fields.id = 0;
      req.models.Student.find({'username': {$in: fav.favorites}}, fields).limit(limit).skip(skip)
      .exec(function (err, students) {
        if (err) {
          res.errorJson('DatabaseProblem');
          return;
        }

        //this is the data
        var responseJson = {
          'data': students
        };

        //add limits if required
        if (limit) {
          responseJson.next = next;
          responseJson.prev = prev;
        }

        //and send it back to the client.
        res.json(responseJson);
      });
    });
  } else {

    //not looking for favorites
    var searchQuery = queryUtils.parse(query.q);

    //we do not want to look for ids.
    fields.id = 0;

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
      res.json(responseJson);
    });
  }
};

/**
* Handles favorities in the system.
* @param {request} req - Request object
* @param {response} res - Result object
* @param {function} next - The next action to run.
* @function controllers.user.actionFavorite
*/
exports.actionFavorite = function (req, res, next) {

  //TODO: Split this up into seperate requests

  // which user do we have (is it a user even)
  var me = req.access.username;
  if (req.access.role !== 'user' || !me) {
    res.errorJson('InvalidRequest');
    return;
  }

  //nothing to do
  if (!req.body.favorite) {
    res.errorJson('InvalidRequest');
    return;
  }

  if (req.params.action === 'add') { //add a user.

    req.models.Favorites.findOneAndUpdate({'user': me}, {$push: {'favorites': req.body.favorite}}, {upsert: true}, function (err, favs) {

      //we could not reach the db
      if (err) {
        res.errorJson('DatabaseProblem');
        return;
      } else {
        //send back all the current favorites.
        res.json({'favorites': favs.favorites});
        return;
      }
    });
  } else if (req.params.action === 'remove') { //remove a user from favs.
    req.models.Favorites.findOneAndUpdate({'user': me}, {$pull: {'favorites': req.body.favorite}}, {upsert: true}, function (err, favs) {
      //we could not reach the databse.
      if (err) {
        res.errorJson('DatabaseProblem');
        return;
      } else {
        //send back all the current favorites.
        res.json({'favorites': favs.favorites});
        return;
      }
    });
  } else {
    //unknown thing to do
    res.errorJson('InvalidRequest');
    return;
  }
};
