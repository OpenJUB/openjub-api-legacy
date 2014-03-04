'use strict';

var jsonUtils = require('../utils/json.js');

exports.get = function (req, res) {
  var query = req.query;

  var conditions = jsonUtils.createConditions(query.q);

  var fields = (query.fields) ? query.fields.split(',') : null;
  fields = jsonUtils.createFields(fields);

  var limit = parseInt(query.limit, 0);
  var skip = parseInt(query.skip || 0);

  if (limit) {
    var url = req.protocol + '://' + req.get('host') + req.path;
    var baseQuery = '?';
    baseQuery += (query.fields) ? ('fields=' + query.fields + '&') : '';
    baseQuery += (query.q) ? ('q=' + query.q + '&') : '';
    var next = url + baseQuery + 'skip=' + (skip+limit) + '&limit=' + limit;
    var prev = (!skip) ? '' : url + baseQuery + 'skip=' + (skip-limit) + '&limit=' + limit;
  }

  req.models.Course.find(conditions, fields).limit(limit).skip(skip).lean()
    .exec(function (err, courses) {
      if (err) {
        res.errorJson('DatabaseProblem');
        return;
      }

      var responseJson = {
        'data': courses
      };

      if (limit) {
        responseJson.next = next;
        responseJson.prev = prev;
      }
      res.json(responseJson);
    });
};

exports.getByNumber = function (req, res) {
  var number = req.params.number;
  var fields = req.query.fields;

  fields = (fields) ? fields.split(',') : null;
  fields = jsonUtils.createFields(fields);

  if (!number) {
    res.errorJson('InvalidRequest');
  }

  req.models.Course.findOne({'number': number}, fields).lean()
    .exec(function (err, course) {
      if (err) {
        res.errorJson('DatabaseProblem');
        return;
      }
      res.json(course);
      return;
    });
};
