module.exports.needs = ['houseIdentifier'];

module.exports.schema = {
  'college': {type: String, enum: ['Krupp', 'C3', 'Nordmetall', 'Mercator', '']}
};  

module.exports.parse = function(obj, next, warn){
  
  // prepare result and account name. 
  var result = {}; 
  
  var username = obj.sAMAccountName;
  while(username.length<=20){
    username += ' '; 
   
  } 
  
  var _college = obj.houseIdentifier || '';
  result.college = parseCollege(_college);
  
  if(!result.college && result.college !== ''){
    warn(username+': Unknown college \''+_college+'\'. '); 
  }
    
  next(null, result); 
};

/**
 * Parses a college name.
 */
function parseCollege(college) {
  if (college === 'Alfried Krupp College') {
    return 'Krupp';
  } else if (college === 'College III') {
    return 'C3';
  } else if (college === 'College Nordmetall') {
    return 'Nordmetall';
  } else if (college === 'Mercator College') {
    return 'Mercator';
  } else if(college === ''){
    return ''; 
  }
}