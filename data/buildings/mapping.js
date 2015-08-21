// load all the building data
var buildings = require("./index.js"); 

// concat for buildings. 
module.exports = (new Array()).concat(
  
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
); 