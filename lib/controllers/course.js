'use strict';
//TODO: Use this file.

var jsonUtils = require('../utils/json.js');

/**
 * Controllers for courses.
 * @namespace controllers.course
 */

 /**
 * Returns a single course.
 * @param {request} req - Request object
 * @param {response} res - Reponse object
 * @function controllers.course.get
 */
exports.get = function (req, res) {

  //find the query and parse it.
  var query = req.query;
  var conditions = jsonUtils.createConditions(query.q);

  //which fields we want
  var fields = jsonUtils.createFields(jsonUtils.ensureStringArr(req.query.fields, []));

  //which pages we want to have
  //TODO: Add a pagination helper.
  var limit = parseInt(query.limit, 0);
  var skip = parseInt(query.skip || 0);

  if (limit) {
    //next page to request.
    var url = req.protocol + '://' + req.get('host') + req.path;
    var baseQuery = '?';
    baseQuery += (query.fields) ? ('fields=' + query.fields + '&') : '';
    baseQuery += (query.q) ? ('q=' + query.q + '&') : '';
    var next = url + baseQuery + 'skip=' + (skip+limit) + '&limit=' + limit;
    var prev = (!skip) ? '' : url + baseQuery + 'skip=' + (skip-limit) + '&limit=' + limit;
  }

  //find the course
  req.models.Course.find(conditions, fields).limit(limit).skip(skip).lean()
    .exec(function (err, courses) {

      //we couldn't find it.
      if (err) {
        res.errorJson('DatabaseProblem');
        return;
      }

      //we have some JSON
      var responseJson = {
        'data': courses
      };

      //and the next part
      if (limit) {
        responseJson.next = next;
        responseJson.prev = prev;
      }
      res.json(responseJson);
    });
};

/**
* Returns a single course by number.
* @param {request} req - Request object
* @param {response} res - Reponse object
* @function controllers.course.getByNumber
*/
exports.getByNumber = function (req, res) {

  //extract course number
  var number = req.params.number;

  //find fields.
  var fields = jsonUtils.createFields(jsonUtils.ensureStringArr(req.query.fields, []));

  //invalid request
  if (!number) {
    res.errorJson('InvalidRequest');
  }

  //find the actual course.
  req.models.Course.findOne({'number': number}, fields).lean()
    .exec(function (err, course) {

      //we could not find it.
      if (err) {
        res.errorJson('DatabaseProblem');
        return;
      }

      //return the course.
      res.json(course);
      return;
    });
};
