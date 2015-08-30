module.exports.needs = ['telephoneNumber', 'physicalDeliveryOfficeName'];

module.exports.schema = {
  'phone': String, 
  'room': String
};  

module.exports.parse = function(obj, next, warn){
  
  // prepare result and account name. 
  var result = {}; 
  
  var username = obj.sAMAccountName;
  while(username.length<=20){
    username += ' '; 
  } 
  
  result.phone = obj.telephoneNumber; 
  result.room = obj.room; 
  
  // TODO: ParseRoom && phoneRoomMapping
  if(result.phone && !result.room){
    // warn(username+': Phone number given, but no room found. '); 
  }
  

  
  next(null, result); 
};