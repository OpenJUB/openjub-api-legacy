// load all the building data
var buildings = require("./index.js");

// concat for buildings.
var all = (new Array()).concat(

  // Research I - V
  buildings.research.i,
  buildings.research.ii,
  buildings.research.iii,
  buildings.research.iv,
  buildings.research.v,

  // The Colleges
  buildings.college.krupp,
  buildings.college.mercator,
  buildings.college.ciii,
  buildings.college.nordmetall,

  // Other
  buildings.other.rlh,
  buildings.other.south_hall,
  buildings.other.campus_center,
  buildings.other.misc
).map(function(e, i){
  return {
    room: buildings.cleanRoom(e.room),
    phone: buildings.cleanPhone(e.room)
  }
});

module.exports = all;

module.exports.findPhone = function(room){
  // clean the room.
  var room = buildings.cleanRoom(room);

  for(var i=0;i<all.length;i++){
    if(all[i].room === room){
      return all[i].phone;
    }
  }

  return null;
};

module.exports.findRoom = function(phone){
  var phone = buildings.cleanPhone(phone);

  for(var i=0;i<all.length;i++){
    if(all[i].phone === phone){
      return all[i].room;
    }
  }

  return null;
}
