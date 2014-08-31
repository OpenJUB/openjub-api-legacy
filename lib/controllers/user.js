'use strict';


var request = require('request');
var settings = require('../../settings');
var jsonUtils = require('../utils/json');
var queryUtils = require('../utils/query');

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

  req.models.Student.find(conditions, fields).limit(limit).skip(skip).lean()
    .exec(function (err, students) {
      if (err) {
        res.errorJson('DatabaseProblem');
        return;
      }

      var responseJson = {
        'data': students
      };

      if (limit) {
        responseJson.next = next;
        responseJson.prev = prev;
      }
      res.json(responseJson);
    });
};

exports.getById = function (req, res) {
  var eid = req.params.eid;
  var fields = req.query.fields;

  fields = (fields) ? fields.split(',') : null;

  fields = jsonUtils.createFields(fields);

  if (!eid) {
    res.errorJson('InvalidRequest');
  }

  req.models.Student.findOne({'eid': eid}, fields).lean()
    .exec(function (err, student) {
      if (err) {
        res.errorJson('DatabaseProblem');
        return;
      }
      res.json(student);
      return;
    });
};

exports.getByAccount = function (req, res) {
  var account = req.params.account;
  var fields = req.query.fields;

  fields = (fields) ? fields.split(',') : null;

  fields = jsonUtils.createFields(fields);

  if (!account) {
    res.errorJson('InvalidRequest');
  }

  req.models.Student.findOne({'username': account}, fields).lean()
    .exec(function (err, student) {
      if (err) {
        res.errorJson('DatabaseProblem');
        return;
      }
      res.json(student);
      return;
    });
};

exports.me = function (req, res) {
  var account = req.access.username;
  var fields = req.query.fields;

  fields = (fields) ? fields.split(',') : null;

  fields = jsonUtils.createFields(fields);

  if (!account) {
    res.errorJson('InvalidRequest');
    return;
  }

  req.models.Student.findOne({'username': account}, fields).lean()
    .exec(function (err, student) {
      if (err) {
        res.errorJson('DatabaseProblem');
        return;
      }
      if (req.access.client_id === 'jpeople') {
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
        res.json(student);
        return;
      }
    });
}

exports.getCountryFlag = function (req, res) {
  return request.get(settings.countryBaseUrl + req.params.country + '.png').pipe(res);
}

exports.getImageByAccount = function (req, res) {
  var account = req.params.account;

  req.models.Student.findOne({'username': account}).lean()
    .exec(function (err, student) {
      if (err || !student) {
        res.errorJson('UserNotFound');
      }

      request.get(settings.imageBaseUrl + student.eid).pipe(res);
    });
};

exports.autocomplete = function (req, res, next) {
  var query = req.query;

  if (!query.q) {
    res.errorJson('InvalidRequest');
    return;
  }


  var fields = (query.fields) ? query.fields.split(',') : null;
  fields = jsonUtils.createFields(fields);

  var limit = parseInt(query.limit, 0);
  var skip = parseInt(query.skip || 0);

  limit = (isNaN(limit)) ? 25 : limit;

  if (limit) {
    var url = req.protocol + '://' + req.get('host') + req.path;
    var baseQuery = '?';
    baseQuery += (query.fields) ? ('fields=' + query.fields + '&') : '';
    baseQuery += (query.q) ? ('q=' + query.q + '&') : '';
    var next = url + baseQuery + 'skip=' + (skip+limit) + '&limit=' + limit;
    var prev = (!skip) ? '' : url + baseQuery + 'skip=' + (skip-limit) + '&limit=' + limit;
  }

  if (query.q.toLowerCase() === 'favorites' && req.access && req.access.role === 'user') {
    var user = req.access.username;
    req.models.Favorites.findOne({'user': user}).lean().exec(function (err, fav) {
      if (err) {
        res.errorJson('DatabaseProblem');
        return;
      }
      if (!fav) {
        res.json({'data': []});
        return;
      }
      fields.id = 0;
      req.models.Student.find({'username': {$in: fav.favorites}}, fields).limit(limit).skip(skip)
        .exec(function (err, students) {
          if (err) {
            res.errorJson('DatabaseProblem');
            return;
          }

          var responseJson = {
            'data': students
          };

          if (limit) {
            responseJson.next = next;
            responseJson.prev = prev;
          }
          res.json(responseJson);
        });
    });
  } else {
    var searchQuery = queryUtils.parse(query.q);
    console.log(searchQuery);
    fields.id = 0;
    req.models.Student.find(searchQuery, fields).limit(limit).skip(skip)
      .exec(function (err, students) {
        if (err) {
          res.errorJson('DatabaseProblem');
          return;
        }

        var responseJson = {
          'data': students
        };

        if (limit) {
          responseJson.next = next;
          responseJson.prev = prev;
        }
        res.json(responseJson);
      });
  }
};

exports.actionFavorite = function (req, res, next) {
  var me = req.access.username;
  if (req.access.role !== 'user' || !me) {
    res.errorJson('InvalidRequest');
    return;
  }

  if (!req.body.favorite) {
    res.errorJson('InvalidRequest');
    return;
  }

  if (req.params.action === 'add') {
    req.models.Favorites.findOneAndUpdate({'user': me}, {$push: {'favorites': req.body.favorite}}, {upsert: true}, function (err, favs) {
      if (err) {
        res.errorJson('DatabaseProblem');
        return;
      } else {
        res.json({'favorites': favs.favorites});
        return;
      }
    });
  } else if (req.params.action === 'remove') {
    req.models.Favorites.findOneAndUpdate({'user': me}, {$pull: {'favorites': req.body.favorite}}, {upsert: true}, function (err, favs) {
      if (err) {
        res.errorJson('DatabaseProblem');
        return;
      } else {
        res.json({'favorites': favs.favorites});
        return;
      }
    });
  } else {
    res.errorJson('InvalidRequest');
    return;
  }
}
