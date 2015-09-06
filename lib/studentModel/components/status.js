module.exports.needs = ['extensionAttribute2', 'extensionAttribute3'];

module.exports.schema = {
  'description': String,
  'status': String,
  'year': String, 
  'majorShort': String,
  'major': String
};

module.exports.completions = {
  'description': '',
  'status': 
    ['undergrad', 'master', 'foundation-year', 'phd', 'phd-integrated', 'winter'],
  // TODO: Find all majors
  'majorShort': [], 
  'major': [], 
  'year': ['04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17'], 
}; 

module.exports.parse = function(obj, next, warn){

  var result = {};
  var username = obj.sAMAccountName;
  while(username.length<=20){
    username += ' ';
  }

  // description: Raw student description.
  result.description = parseDescription(obj.extensionAttribute2 || '');

  var description = understandDescription(result.description);

  if(description.length < 2){
    result.status = '';
    result.year = '';
    result.majorShort = '';
    result.major = '';
  } else {
    result.status = parseStatus(description[0]);

    if(result.status === 'error'){
      warn(username+': Unknown status \''+description[0]+'\'');
    }

    result.year = parseYear(description[1]);
    result.majorShort = parseMajorShort(description);
    result.major = obj.extensionAttribute3 || '';
  }

  next(null, result);
};

module.exports.unparse = function(data, next){
  next(null, {
    'extensionAttribute2': data.description.replace(/int_/g, 'int '),
    'extensionAttribute3': data.major
  });
};

module.exports.join = function(auto, ldapA, ldapB, next){
  next(null, {
    'extensionAttribute2': auto('extensionAttribute2', ldapA, ldapB), 
    'extensionAttribute3': auto('extensionAttribute3', ldapA, ldapB)
  }); 
};

/**
 * Parses the description of a student.
 */
function parseDescription(desc){
  return desc
  .replace(/int /g, 'int_')
  .replace(/class /g, '');
}

function understandDescription(desc){
  return desc.replace(/\(.*\)/g, '')
  .split(' ');
}

/**
 * Parses a status name.
 */
function parseStatus(status, username) {
  status = status.toLowerCase();
  if (status === 'ug') {
    return 'undergrad';
  } else if (status === 'm') {
    return 'master';
  } else if (status === 'fy') {
    return 'foundation-year';
  } else if (status === 'phd') {
    return 'phd';
  } else if (status === 'int_phd') {
    return 'phd-integrated';
  } else if (status === 'winter') {
    return 'winter';
  } else if(status !== ''){
    return 'error';
  }
}

function parseYear(year){
  var pYear = parseInt(year, 10);
  pYear = isNaN(pYear) ? '' : pYear.toString();

  if(pYear.length === 1){
    pYear = '0'+pYear;
  }

  return pYear;
}

function parseMajorShort(description){
  return description.slice(2).join(' ').trim();
}
