module.exports.needs = ['employeeID', 'sAMAccountName', 'mail'];

module.exports.schema = {
  'eid': {type: String, required: true}, 
  'email': String, 
  'username': {type: String, required: true},
  'active': {type: Boolean, required: true}
}; 

module.exports.completions = {
  'eid': '', 
  'email': '',
  'username': '', 
  'active': [true, false]
}; 

module.exports.parse = function(obj, next, warn){
  var eid = parseInt(obj.employeeID);
  
  if(!eid){
    next(new Error('Missing employeeId. '), null);
    return; 
  }
  
  var username = obj.sAMAccountName;
  while(username.length<=20){
    username += ' '; 
  } 
  
  if(!username){
      next(new Error('Missing username. '), null);
      return; 
  }
  
  var email = obj.mail || ''; // parse Email and complain about non jacobs-mail
  

  
  if(email === ''){
    if(obj.active){
      warn(username+': Active User missing email address. ');
    }
  } else if(!email.match(/@jacobs\-university\.de$/g)){
    if(obj.active){
      warn(username+': \''+email+'\' is not a jacobs mail address. ');
    }
  }
  
  next(null, {
    'eid': eid.toString(),
    'username': username.trim(), 
    'email': email, 
    'active': obj.active
  }); 
};

module.exports.unparse = function(data, next){
  next(null, {
    'employeeID': data.eid, 
    'sAMAccountName': data.username || '', 
    'mail': data.email || '', 
    'active': data.active || false
  }); 
}; 

module.exports.join = function(auto, ldapA, ldapB, next){
  var joined = {}; 
  
  next(null, {
    'employeeID': auto('employeeID', ldapA, ldapB), 
    'sAMAccountName': auto('sAMAccountName', ldapA, ldapB), 
    'mail': auto('mail', ldapA, ldapB), 
    'active': ldapA.active || ldapB.active, 
  }); 
};