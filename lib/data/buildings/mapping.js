// load all the building data
var buildings = require("./index.js");

var addBuilding = module.exports.addBuilding = function addBuilding(rooms, building){
  return rooms.map(function(e){
    e.building = building;
    return e;
  });
};


// concat for buildings.
var all = (new Array()).concat(

  // Research I - V
  addBuilding(buildings.research.i, 'Research 1'),
  addBuilding(buildings.research.ii, 'Research 2'),
  addBuilding(buildings.research.iii, 'Research 3'),
  addBuilding(buildings.research.iv, 'Research 4'),
  addBuilding(buildings.research.v, 'Research 5'),

  // The Colleges
  addBuilding(buildings.college.krupp, 'Krupp'),
  addBuilding(buildings.college.mercator, 'Mercator'),
  addBuilding(buildings.college.ciii, 'C3'),
  addBuilding(buildings.college.nordmetall, 'Nordmetall'),

  // Other
  addBuilding(buildings.other.rlh, 'Reimar Lüst Hall'),
  addBuilding(buildings.other.south_hall, 'South Hall'),
  addBuilding(buildings.other.campus_center, 'Campuse Center'),
  addBuilding(buildings.other.misc, '')
).map(function(e, i){
  return {
    room: buildings.cleanRoom(e.room),
    phone: buildings.cleanPhone(e.phone),
    building: e.building
  }
});

module.exports = all;

module.exports.findPhone = function findPhone(room){
  // clean the room.
  var room = buildings.cleanRoom(room);

  for(var i=0;i<all.length;i++){
    if(all[i].room === room){
      return all[i].phone;
    }
  }

  return null;
};

module.exports.findRoom = function findRoom(phone){
  var phone = buildings.cleanPhone(phone);

  for(var i=0;i<all.length;i++){
    if(all[i].phone === phone){
      return all[i].room;
    }
  }

  return null;
}
