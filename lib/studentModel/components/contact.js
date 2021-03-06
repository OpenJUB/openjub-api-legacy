var winston = require('winston');
var phoneRoomData = require('../../data/buildings');
var phoneRoomMapping = require('../../data/buildings/mapping');

module.exports.needs = ['telephoneNumber', 'physicalDeliveryOfficeName'];

module.exports.schema = {
  'phone': String,
  'room': String, 
  'isCampusPhone': Boolean
};

module.exports.completions = {
  'phone': /^(?:(?:00)?\s?49\s*)?(?:\s*200)?\s*(\d{4})$/g,
  'room': '',
  'isCampusPhone': [true, false]
}; 

module.exports.parse = function(obj, next, warn){
  // prepare result and account name.
  var result = {};

  var username = obj.sAMAccountName;
  while(username.length<=20){
    username += ' ';
  }

  result.phone = phoneRoomData.cleanPhone(obj.telephoneNumber);
  result.room = phoneRoomData.cleanRoom(obj.room);
  result.isCampusPhone = (result.phone.match(/^(\d){4}$/g))?true:false;

  if(obj.active){
    var hasRoom = (result.room !== '');
    var hasPhone = (result.phone !== '');
    

    // we have a phone and a room.
    if(hasRoom && hasPhone){
      if(hasCampusPhone){
        var room = phoneRoomMapping.findRoom(result.phone);

        if(!room){
          // winston.log('warn', 'Data for '+result.phone+' missing from phoneRoomMapping data. ');
        }
      }


    } else if(hasPhone && !hasRoom){
      if(result.isCampusPhone){
        var room = phoneRoomMapping.findRoom(result.phone);

        if(!room){
          winston.log('warn', username+': Only phone number, no room given. phoneRoomData for '+result.phone+' not available. ');
        } else {
          // winston.log('warn', username+': Only phone number, no room given. phoneRoomData used. ');
          result.room = room;
        }
      }
    } else if(!hasPhone && hasRoom){
      if(result.isCampusPhone){
        var phone = phoneRoomMapping.findPhone(result.room);

        if(!phone){
          winston.log('warn', username+': Only room, no phone number given. phoneRoomData for '+result.room+' not available. ');
        } else {
          // winston.log('warn', username+': Only room, no phone number given. phoneRoomData used. ');
          result.phone = phone;
        }
      }
    } else {
      // winston.log('warn', username+': Active user with neither room nor phone number given. ');
    }
  }

  next(null, result);
};

module.exports.unparse = function(data, next){
  next(null, {
    'telephoneNumber': data.phone,
    'physicalDeliveryOfficeName': data.room
  });
};

module.exports.join = function(auto, ldapA, ldapB, next){
  next(null, {
    'telephoneNumber': auto('telephoneNumber', ldapA, ldapB),
    'phone': auto('phone', ldapA, ldapB)
  });
};
