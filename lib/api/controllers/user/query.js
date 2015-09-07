var mongoose = require("mongoose");
var async = require("async");
var jsonUtils = require("../../../utils/json");
var MongooseStudentModel = mongoose.model('Student');
var StudentModel = require('../../../studentModel')

/**
 * Queries for a single user given a mongodb query.
 * @param {Object} query - a mongodb query to execute.
 * @param {string[]} fields - Fields to query for.
 * @param {function} next - Callback after query.
 */
var queryOne = module.exports.queryOne = function queryOne(query, req, res, fields, next){
  var rFields = StudentModel.fields(fields);

  // make a query for the given fields
  MongooseStudentModel.findOne(query, function(err, doc){

    if(err || !doc){
      next(err, doc);
      return;
    }

    doc.toRealObject(req, res, rFields, next);
    return;
  });
};

var query = module.exports.query = function query(query, req, res, next){
  MongooseStudentModel.find(query, next);
};

var queryJoin = module.exports.queryJoin = function queryJoin(queries, skip, limit, fields, req, res, next){
  // fields to query for.
  var rFields = StudentModel.fields(fields);

  // indexes to use eventually.
  var startIndex = skip;
  var endIndex = skip+limit;

  // asyncronously fetch all the results.
  async.map(queries, function(sQuery, qNext){
    query(sQuery, req, res, qNext);
  }, function(err, res){

    // if there is an error
    // we exit.
    if(err){
      next(err, null, null);
      return;
    }

    // get all the results without doubles
    // we use the eid property to uniquely identify people.
    var allResults = jsonUtils.removeJSONDoubles(
      Array.prototype.concat.apply([], res),
      function(user){
        return user['eid'];
      }
    );

    // we count and slice the results
    // the user wanted.
    var count = allResults.length;
    allResults = allResults.splice(startIndex, endIndex);

    async.map(allResults, function(d, dNext){
      return d.toRealObject(req, res, rFields, dNext);
    }, function(err, results){

      if(err){
        next(err, null, null);
        return;
      }

      next(null, results, count);
    });

    // and return that.

    return;
  });
}
