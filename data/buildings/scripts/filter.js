var mapping = require("../mapping"); 

var filter = function(e){
  return e.phone[0] == "5"; 
}

var filter_in = mapping.filter(function(e){
  if(typeof e == "undefined"){
    return false; 
  }
  return filter(e); 
});

var filter_out = mapping.filter(function(e){
  if(typeof e == "undefined"){
    return false; 
  }
  return !filter(e); 
})

//console.log(filter_in); 
console.log(filter_out); 