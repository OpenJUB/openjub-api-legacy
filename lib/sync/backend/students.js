var winston = require('winston');
var async = require('async');

var jsonUtils = require('../../utils/json');
var MongooseStudentModel = require('../../db/models').Student;

var import_ldap = require('./import_ldap');
var update = require('./update');


/**
 * Syncronises the database with ldap.
 */
module.exports.update = function(user, pass, next){
  async.series([
    import_ldap.bind(this, {
      'username': user,
      'password': pass
    }),
    MongooseStudentModel.find.bind(MongooseStudentModel, {})
  ], function(err, res){

    if(err){
      winston.log('error', 'Error loading data. ');
      process.exit(1);
      return;
    }

    var ldapUsers = res[0];
    var dbUsers = res[1];

    var hashing = function(e, idx){
      return parseInt(e['eid']);
    };


    var diff = jsonUtils.diffKey(ldapUsers, hashing, dbUsers, hashing);

    var added = diff[0]; //only in LDAP
    var removed = diff[1]; // only in DB
    var updated = diff[2]; // data in both.

    // some logging
    winston.log('info', ldapUsers.length+' user(s) retrieved from LDAP, '+dbUsers.length+' user(s) currently inside database. ');
    winston.log('info', updated.length+' user(s) to be updated, '+added.length+' user(s) to be added, '+removed.length+' user(s) no longer in LDAP. ');

    // and update, add && reparse.
    async.series([
      update.updateUsers.bind(this, updated),
      update.addUsers.bind(this, added),
      update.reparseUsers.bind(this, removed)
    ], function(err){
      if(err){
        process.exit(1);
      } else {
        next();
      }
    });
  });
};
