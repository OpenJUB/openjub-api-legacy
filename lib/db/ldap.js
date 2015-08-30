var ActiveDirectory = require('activedirectory');

var settings = require('../settings');

var url = module.exports.url = "ldap://"+settings.ldap.host;

module.exports.bind = function(query, user, password, next){
  return module.exports.bindFields(query, user, password, [], next); 
}; 

module.exports.bindFields = function(query, user, password, fields, next){

  var config = {
    url: url,
    baseDN: query+'ou=users,ou=campusnet,DC=jacobs,DC=jacobs-university,DC=de',
    username: user+'@'+settings.ldap.host,
    password: password,
    includeMembership: ['user'],
    attributes: {
       user: fields
     }
  };

  var ad = new ActiveDirectory(config);

  ad.authenticate(user+'@'+settings.ldap.host, password, function(err, auth){
    if(!auth){
      next(err?err:new Error('Did not authenticate. '), null);
    } else {
      next(null, ad);
    }
  });
}
