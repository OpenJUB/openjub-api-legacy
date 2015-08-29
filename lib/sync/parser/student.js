var async = require('async');
var winston = require('winston');



module.exports.parseStudent = function parseStudent(obj, next) {
  var result = {};

  //
  // EID, USERNAME, EMAIL
  //

  // eid: Unique Id (number)
  result.eid = obj.employeeID;

  // username: Unique campusnet username
  var username = result.username = obj.sAMAccountName;

  // email: Mail adress
  result.email = parseEmail(obj.mail || '', username); // parse Email and complain about non jacobs-mail

  // missing fields => die()
  if (!result.username || !result.eid) {
    die('User missing id or username. ', username, next);
    return;
  }

  //
  // NAME
  //

  var name = parseName(obj.displayName);

  // first name: Student first name only.
  result.firstName = name[1];

  // lastName : Student last name only.
  result.lastName = name[0];

  // fullName : Complete name of the student
  result.fullName = result.firstName + ' ' + result.lastName;

  // parsedName : Parsed Name into components.
  result.parseName = {
    'firstName': null,
    'lastName': null
  }

  // no name => die()
  if(!name){
    die('User missing proper name. ', username, next);
    return;
  }

  // country: Country of Origin
  result.country = obj.extensionAttribute5 || '';

  //room : room on campus. TODO: Parse me.
  result.room = obj.physicalDeliveryOfficeName;

  // college : college (if available), one of 'Krupp', 'C3', 'Mercator', 'Nordmetall'
  result.college = parseCollege(obj.houseIdentifier);

  // phone: phone number (if available)
  result.phone = obj.telephoneNumber || '';

  // major: student major
  result.major = obj.extensionAttribute3 || '';

  // type : general person type. May be multiple.
  result.type = parseEmployeeTypes((obj.employeeType || ''), username);

  // active : is the user active?
  result.active = obj.active;

  // description: Raw student description.
  result.description = parseDescription(obj.extensionAttribute2 || '');

  var description = understandDescription(result.description);

  if(description.length < 2){
    // user is not a student.
    // so we can ignore all this stuff.
    // TODO: Check if this corellates with employeeType
    result.status = '';
    result.year = '';
    result.majorShort = '';
    result.major = '';
  } else {
    // status: Student status.
    result.status = parseStatus(description[0], username);
    result.year = parseYear(description[1], username);
    result.majorShort = parseMajorShort(description, username);
  }

  // TODO: Compare major and majorShort
  // TODO: Check for student data stuff

  //console.log(result);

  async.setImmediate(function () {
    next(null, result);
  });
};

/**
 * Parses a student name.
 */
function parseName(name){
  return name.split(", ");
}

/**
 * Parses a college name.
 */
function parseCollege(college) {
  if (college === 'Alfried Krupp College') {
    return 'Krupp';
  } else if (college === 'College III') {
    return 'C3';
  } else if (college === 'College Nordmetall') {
    return 'Nordmetall';
  } else if (college === 'Mercator College') {
    return 'Mercator';
  } else if (college === '') {
    winston.log('warn', 'Unknown college '+college);
    return '';
  } else {
    return '';
  }
}
/**
 * Parses the employee type.
 */
function parseEmployeeTypes(type, username){

  var types = [];


  type.split(';').map(function(t){
    var ct = parseEmployeeType(t.trim(), username);

    if(ct && types.indexOf(ct) == -1){
      types.push(ct);
    }
  });

  // TODO: parse employee types.
  return types;
}

function parseEmployeeType(type, username){

  // STUDENTS
  if(type === 'Student'){
    return 'Student';
  } else if(type === 'Gueststudent'){
    return 'Student (guest)';
  } else if(type === 'Exchange Student'){
    return 'Student (exchange)'
  } else if(type === 'external Student'){
    return 'Student (external)'
  } else if(type === 'Visiting Student'){
    return 'Student (visiting)'
  }

  //FACULTY
  if(type === 'Professor'){
    return 'Professor';
  } else if(type === 'Visiting Professor'){
    return 'Professor (Visiting)';
  } else if(type === 'Adjunct Professor'){
    return 'Professor (Adjunct)';
  } else if(type === 'Lecturer'){
    return 'Lecturer'
  } else if(type === 'University Lecturer'){
    return 'Lecturer (University)'
  } else if(type === 'Further Lecturer'){
    return 'Lecturer (other)'
  } else if(type === 'external Instructor'){
    return 'Instructor (external)';  // Is this a lecturer?
  } else if(type === 'Scientific Fellow'){
    return 'Scientific Fellow';
  } else if(type === 'Research Associate'){
    return 'Research Associate'
  } else if(type === 'Teaching Assistant'){
    return 'Teaching Assistant'
  } else if(type === 'Research Assistant'){
    return 'Research Assistant'
  } else if(type === 'sonstige Faculty'){
    return 'Faculty (other)';
  }


  //ADMIN & STAFF
  if(type === 'President/Vice President'){
    return 'President & Vice President';
  } else if(type === 'Director'){
    return 'Director';
  } else if(type === 'Assistant'){
    return 'Assistant';
  } else if(type === 'Technician'){
    return 'Technician';
  } else if(type === 'Mitarbeiter sonstige'){
    return 'Staff (other)';
  } else if(type === 'Praktikant'){
    return 'Intern';
  }


  if(type != ''){
    warn('Unknown employee type \''+type+'\'', username);
  }
}

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

function parseEmail(mail, username){

  if (mail == ''){
    // warn('Missing email. ', username);
  } else if(!mail.match(/@jacobs\-university\.de$/g)){
    warn('\''+mail+'\' is not a jacobs mail adress. ', username);
  }

  return mail;
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
  } else if(status === '') {
    return '';
  } else {
    warn('Unknown student status '+status, username);
    return '';
  }
}

function parseYear(year, username){
  var pYear = parseInt(year, 10);
  pYear = isNaN(pYear) ? '' : pYear.toString();

  if(pYear.length === 0){
    // warn('Missing year. ', username);
  } else if(pYear.length === 1){
    pYear = '0'+pYear;
  }

  return pYear;
}

function parseMajorShort(description, username){
  // TODO: Check for unknowns
  return description.slice(2).join(' ').trim();
}

function warn(msg, username){
  winston.log('warn', 'User \''+username+'\': '+msg)
}
function die(msg, username, next){
  warn(msg, username);
  async.setImmediate(next.bind(this, null, null));
  return;
}
