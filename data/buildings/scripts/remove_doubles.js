var mapping = require("../mapping"); 

// check if an array contains a room. 
var contains = function(arr, room){
  for(var i=0;i<arr.length;i++){
    if(arr[i].phone == room.phone){
      return true; 
    }
  }
  
  return false; 
}

var new_array = []; 

// go over the old array
mapping.map(function(e){
  if(!contains(new_array, e)){
    new_array.push(e); 
  }
})

// sort the new array
console.log(new_array.sort(function(a, b){
  return parseInt(a.phone, 10) - parseInt(b.phone, 10);  
})); 