var winston = require('winston');
var async = require('async');

var MongooseStudentModel = require('../../db/models').Student;
var studentModel = require('../../studentModel');

/**
 * Updates users in the database by replacing the old data.
 */
module.exports.updateUsers = function updateUsers (users, next){
  winston.log('info', 'Starting to update users, this might take a while. ');

  async.map(
    users,
    function(u, uNext){
      // drop the old instance
      MongooseStudentModel.remove({'eid': u['eid']}, function(err, res){
        if(err){
          uNext(err, null);
          return;
        }

        // and save the new data.
        var si = new MongooseStudentModel(u);
        si.save(uNext);
      });
    },
    function(err, res){
      if(err){
          winston.log('error', 'Error updating user(s). ');
          winston.log('error', err.message);
          next(err, res);
          return;
      }

      winston.log('info', 'Done. '+res.length+' user(s) have been updated. ');
      next(null, res.length);
    }
  );
};

/**
 * Adds new users to the database.
 */
module.exports.addUsers = function addUsers(users, next){
  winston.log('info', 'Starting to add users, this might take a while. ');

  async.map(
    users,
    function(u, uNext){
      new MongooseStudentModel(u).save(uNext);
    },
    function(err, res){
      if(err){
          winston.log('error', 'Error adding user(s). ');
          winston.log('error', err.message);
          next(err, res);
          return;
      }

      winston.log('info', 'Done. '+res.length+' user(s) added to the database. ');
      next(null, res.length);
    }
  );
};

/**
 * Reparses users in the datatabse.
 */
module.exports.reparseUsers = function reparseUsers(users, next){

  winston.log('info', 'Starting to reparse users, this might take a while. ');

  async.map(
    users,
    function(u, uNext){

        // re-parse it
      studentModel.reParse(u, function(err, _new){
        if(err){
          uNext(err);
          return;
        }

        // drop the old one.
        u.remove(function(err, res){
          if(err){
            uNext(err, null);
            return;
          }

          // user is no longer active.
          _new.active = false;

          // adn re-create it.
          var si = new MongooseStudentModel(_new);
          si.save(uNext);
        });

      });
    },
    function(err, res){
      if(err){
          winston.log('error', 'Error reparsing user(s). ');
          winston.log('error', err.message);
          next(err, res);
          return;
      }

      winston.log('info', ''+res.length+' user(s) have been reparsed. ');
      next(null, res.length);
    }
  );
};
