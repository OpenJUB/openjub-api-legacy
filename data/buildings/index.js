module.exports.research = require("./research");
module.exports.college = require("./college");
module.exports.other = require("./other");

// TODO: Clean the room.
module.exports.cleanRoom = function(room){
  var sRoom = room || '';
  return sRoom.trim();
};

module.exports.cleanPhone = function(phone){
  var sPhone = phone || '';
  return sPhone.trim();
}
