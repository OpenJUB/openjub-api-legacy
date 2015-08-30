module.exports.needs = ['displayName'];

module.exports.schema = {
  
  'firstName': String, 
  'lastName': String, 
  'fullName': String, 
  
  'nameComponents': [
    {'firstName': [String]}, 
    {'lastName' : [String]}
  ]
};  

module.exports.parse = function(obj, next, warn){
  
  // prepare result and account name. 
  var result = {}; 
  
  var username = obj.sAMAccountName;
  while(username.length<=20){
    username += ' '; 
  } 
  
  var name = parseName(obj.displayName);

  // first name: Student first name only.
  result.firstName = name[1];

  // lastName : Student last name only.
  result.lastName = name[0];

  // fullName : Complete name of the student
  result.fullName = result.firstName + ' ' + result.lastName;

  // parsedName : Parsed Name into components.
  result.nameComponents = {
    'firstName': parseNameComponents(name[1]),
    'lastName': parseNameComponents(name[0])
  }

  // no name => die()
  if(!name){
    next(new Error(username+': Missing Name. '), null);
    return;
  }
    
  next(null, result); 
};

/**
 * Parses a student name.
 */
function parseName(name){
  return name.split(', ');
};

/**
 * Splits a name into components.
 */
function parseNameComponents(comp){
  return comp

  // split by spaces and - s
  .split(/[\s-]/)

  // trim the strings and make sure they are normalised.
  .map(function(e, idx){return e.trim().toLowerCase(); })

  // and remove empty ones.
  .filter(function(e,idx){return e!=''});
}