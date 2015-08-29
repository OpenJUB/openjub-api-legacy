var settings = require('../../../settings');
var ldap = require('../../../db/ldap');

/**
 * Check if an ip adress originates on campus.
 * @param {string} ip - Adress to check.
 * @private
 * @function controllers.auth.checkCampusIp
 */
module.exports.checkCampusIp = function checkCampusIp(ip) {
  return (
    //subnet 10.*.*.*
    ip.indexOf('10.') === 0 ||
    ip.indexOf('::ffff:10.') === 0 ||

    //localhost 127.0.0.1 / ::1
    ip === '127.0.0.1' ||
    ip === '::ffff:127.0.0.1' ||
    ip === '::1'
  );
}

/**
* Tries to login the user to ldap.
* @param {string} user - Username to login with.
* @param {string} pass - Password to login with.
* @private
* @function controllers.auth.loginLDAP
*/
module.exports.loginLDAP = function loginLDAP(user, pass, callback){

  //normalise user
  user = user.toLowerCase().replace(/\s+/, '');

  //check for non-empty password.
  if(user === '' || pass === ''){
    callback(false);
    return;
  }

  //bind to it.
  ldap.bind('', user, pass, function (err, client) {
    if(err){
      callback(false);
      return;
    } else {
      callback(user);
      return;
    }
  });
};
