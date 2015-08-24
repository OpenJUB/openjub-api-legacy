module.exports.parseStudent = function parseStudent(obj) {
  var result = {};
  
  // log it for now
  console.log(obj); 
  return

  var name = obj.displayName.split(", ");

  if (!name) {
    return null;
  }

  result.firstName = name[1];
  result.lastName = name[0];
  result.fullName = result.firstName + ' ' + result.lastName;
  result.eid = obj.employeeID;
  result.username = obj.sAMAccountName;

  // mandatory fields are missing
  // this might not be a student after all
  if (!result.username || !result.firstName || !result.lastName || !result.eid) {
    return null;
  }
  
  // get the employee type. 
  result.type = obj.employeeType;
  if (!result.type) {
    result.type = "";
  }
  
  // get the email.
  result.email = obj.mail;
  if (!result.email) {
    result.email = "";
  }
  
  // get the major
  result.major = obj.extensionAttribute3;
  if (!result.major) {
      result.major = "";
  }

  result.country = obj.extensionAttribute5;
  if (!result.country) {
    result.country = "";
  }

  result.description = obj.extensionAttribute2;
  if (!result.description) {
    result.description = "";
  }

  result.phone = obj.telephoneNumber;
  if (!result.phone) {
    result.phone = "";
  }

  result.description = result.description.replace(/int /g, 'int_');
  result.description = result.description.replace(/class /g, '');
  var description = result.description.replace(/\(.*\)/g, '');
  description = description.split(' ');
  if (description.length >= 2) {
    result.status = parseStatus(description[0]);
    result.year = parseInt(description[1], 10);
    result.year = isNaN(result.year) ? '' : result.year.toString();
    result.majorShort = description.slice(2).join(' ').trim();
  } else {
    result.year = '';
    result.majorShort = '';
    result.status = '';
  }


  result.college = parseCollege(obj.houseIdentifier);

  //result.room = ... - need to create a map phone->room
  //result.courses = obj.memberOf; - too ugly, needs parsing of some sort.
  return result;
};

function parseCollege(obj) {
  if (obj === "Alfried Krupp College") {
    return "Krupp";
  }
  else if (obj === "College III") {
    return "C3";
  }
  else if (obj === "College Nordmetall") {
    return "Nordmetall";
  }
  else if (obj === "Mercator College") {
    return "Mercator";
  }
  else {
    return "";
  }
}

function parseStatus(status) {
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
  } else {
    return '';
  }
}
