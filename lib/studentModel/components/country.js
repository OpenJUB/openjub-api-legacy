module.exports.needs = ['extensionAttribute5'];

module.exports.schema = {
  'country': String,
  'flag': String,
  'image': String
};

module.exports.parse = function(obj, next, warn){

  // prepare result and account name.
  var result = {};

  var username = obj.sAMAccountName;
  while(username.length<=20){
    username += ' ';
  }

  result.country = obj.extensionAttribute5 || '';
  result.flag = '/flags/'+result.country.replace(' ', '_')+'.png';
  result.image = '/user/image/'+obj.sAMAccountName+'/image.jpg'

  if(obj.active && !result.country){
    // TODO: Take care of missing countries.
    // not sure what to do here though
    // warn(username+': Active User without a country. ');
  }

  next(null, result);
};

module.exports.runtime = function(parsed, req, res, next){

  next(null, {

    // Country is as-is
    'country': parsed.country,

    // Image and flag have post-fixes
    'image': (req.prefix || '')+parsed.image+(req.suffix || ''),
    'flag': (req.prefix || '')+parsed.flag

  });
};

module.exports.unparse = function(data, next){
  next(null, {
    'extensionAttribute5': data.country
  });
};
