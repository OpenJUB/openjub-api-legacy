var mongoose = require("mongoose");
var async = require("async");
var jsonUtils = require("../../../utils/json");
var studentModel = mongoose.model('Student');

/**
 * Queries for a single user given a mongodb query.
 * @param {Object} query - a mongodb query to execute.
 * @param {string[]} fields - Fields to query for.
 * @param {function} next - Callback after query.
 */
var queryOne = module.exports.queryOne = function queryOne(query, requestPrefix, requestSuffix, fields, next){
  var rFields = [];

  // make a query for the given fields
  studentModel.findOne(query, rFields.join(" "), function(err, doc){

    if(err || !doc){
      next(err, doc);
      return;
    }

    doc.toRealObject(requestPrefix, requestSuffix, fields, next);
    return;
  });
};

var query = module.exports.query = function query(query, requestPrefix, requestSuffix, rFields, next){
  studentModel.find(query, rFields.join(" "), function(err, docs){

    if(err || !docs){
      next(err, docs);
      return;
    }
    async.map(
      docs,
      function(d, dNext){
        return d.toRealObject(requestPrefix, requestSuffix, rFields, dNext);
      },
      next
    )
  });
};

var queryJoin = module.exports.queryJoin = function queryJoin(queries, skip, limit, fields, requestPrefix, requestSuffix, next){
  // fields to query for.
  var rFields = []; 

  // indexes to use eventually.
  var startIndex = skip;
  var endIndex = skip+limit;

  // asyncronously fetch all the results.
  async.map(queries, function(sQuery, callback){
    query(sQuery, requestPrefix, requestSuffix, rFields, callback);
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
        return user["eid"];
      }
    );

    // we count and slice the results
    // the user wanted.
    var count = allResults.length;
    allResults.slice(startIndex, endIndex);

    // and return that.
    next(null, allResults, count)
    return;
  });
}
