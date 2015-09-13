function next(token, id){
  var data = {
    'token': token, 
    'id': id
  };
  
  window.opener.postMessage(JSON.stringify(data), '*');
  window.close(); 
}