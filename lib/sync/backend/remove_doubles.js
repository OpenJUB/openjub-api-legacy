var MongooseStudentModel = require('../../db/models').Student;
var studentModel = require('../../studentModel');
var winston = require('winston');
var async = require('async');

module.exports = function(next){

  winston.log('info', 'Checking for duplicates, please wait ...');

  MongooseStudentModel.aggregate(
    [
      { $group:
        {
          _id: { eid: "$eid" },
          uniqueIds: { $addToSet: "$_id" },
          count: { $sum: 1 }
        }
      },

      {
        $match:
        {
          count: { $gte: 2 }
        }
      }
    ], function(err, res){

      if(err){
        winston.log('error', 'Error looking for duplicates. ');
        winston.log('error', err.message);
        winston.log('error', 'Fatal error encountered, exiting. ');
        process.exit(1);
        return;
      }

      if(res.length === 0){
        winston.log('info', 'Done, no duplicates detected, database is clean. ');
        next(null, null);
        return;
      }

      winston.info('warn', 'Done, found '+res.length+' duplicate user(s). ');

      async.map(
        res,
        function(e, eNext){
          MongooseStudentModel.find({
            '_id': { $in: e.uniqueIds }
          }, function(err, docs){
            if(err){
              eNext(err, null);
              return;
            }

            var eid = e._id.eid;
            winston.log('warn', 'Joining '+docs.length+' users with eid '+eid+'. ');
            studentModel.runJoin(docs, function(err, joined){
              if(err || !docs){
                eNext(err, null);
                return;
              }

              MongooseStudentModel.remove({
                '_id': { $in: e.uniqueIds }
              }, function(err){
                if(err){
                  eNext(err, null);
                  return;
                }

                new MongooseStudentModel(joined).save(eNext);
              });
            });
          });
        },
        function(err, res){
          if(err){
            winston.log('Error joining users. ');
            winston.log('error', 'Fatal error encountered, exiting. ');
            process.exit(1);
          }

          winston.log('info', 'Finished cleaning up duplicates. ');
          next(null, null);
        }
      );
  });
}
