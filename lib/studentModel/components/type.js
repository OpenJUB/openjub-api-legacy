module.exports.needs = ['employeeType'];

module.exports.schema = {
  'type': [{type: 'String'}],
  'isStudent': Boolean,
  'isFaculty': Boolean,
  'isStaff': Boolean
};

module.exports.completions = {
  'type': ['Student', 'Student (guest)', 'Student (exchange)', 'Student (external)', 'Student (visiting)', 'Teaching Assistant', 'Research Assistant', 'Professor', 'Professor (Visiting)', 'Professor (Adjunct)', 'Lecturer', 'Lecturer (University)', 'Lecturer (other)', 'Instructor (external)', 'Scientific Fellow', 'Research Associate', 'Faculty (other)', 'President & Vice President', 'Director', 'Assistant', 'Technician', 'Staff (other)', 'Intern', 'Temporary'],
  'isStudent': [true, false],
  'isFaculty': [true, false],
  'isResearcher': [true, false],
  'isAdmin': [true, false], 
  'isStaff': [true, false]
};

module.exports.parse = function(obj, next, warn){

  var username = obj.sAMAccountName;
  while(username.length<=20){
    username += ' ';
  }

  var isStudent = false;
  var isResearcher = false;
  var isFaculty = false;
  var isAdmin = false;

  var _types = (obj.employeeType || '').split(';');
  var types = [];

  _types.map(function(e, idx){

    var f = e.trim();

    if(f === ''){
      return;
    }

    var parsedType = parseEmployeeType(f);

    // if we do not have a type, we should warn.
    if(obj.active && parsedType === ''){
      warn(username+': Active user with unknown employee type \''+e+'\'');
      return;
    }

    // unpack
    var typeName = parsedType[0];
    var typeGroup = parsedType[1];

    // check which group this person is in
    if(typeGroup === 'student'){
      isStudent = true;
    }
    if(typeGroup === 'faculty'){
      isFaculty = true;
    }
    if(typeGroup === 'admin'){
      isStaff = true;
    }
    if(typeGroup === 'researcher'){
      isResearcher = true;
    }


    // add the type if we do not yet have it.
    if(types.indexOf(typeName) === -1){
      types.push(typeName)
    }

  });

  next(null, {
    'type': types,
    'isStudent': isStudent,
    'isFaculty': isFaculty,
    'isResearcher': isResearcher,
    'isAdmin': isAdmin,
    'isStaff': isAdmin || isResearcher
  });
};

module.exports.unparse = function(data, next){

  if(!Array.isArray(data.type)){
    data.type = [data.type];
  }

  next(null, {
    'employeeType': data.type.map(unparseEmployeeType).join(';')
  });
};
module.exports.join = function(auto, ldapA, ldapB, next){
  next(null, {
    'employeeType': auto('employeeType', ldapA, ldapB)
  });
};

function unparseEmployeeType(type){

  // STUDENTS
  if(type === 'Student'){
    return 'Student; '
  } else if(type === 'Student (guest)'){
    return 'Gueststudent';
  } else if(type === 'Student (exchange)'){
    return 'Exchange Student';
  } else if(type === 'Student (external)'){
    return 'external Student';
  } else if(type === 'Student (visiting)'){
    return 'Visiting Student';
  } else if(type === 'Teaching Assistant'){
    return 'Teaching Assistant';
  } else if(type === 'Research Assistant'){
    return 'Research Assistant';
  }

  //FACULTY
  if(type === 'Professor'){
    return 'Professor';
  } else if(type === 'Professor (Visiting)'){
    return 'Visiting Professor';
  } else if(type === 'Professor (Adjunct)'){
    return 'Adjunct Professor';
  } else if(type === 'Lecturer'){
    return 'Lecturer';
  } else if(type === 'Lecturer (University)'){
    return 'University Lecturer';
  } else if(type === 'Lecturer (other)'){
    return 'Further Lecturer';
  } else if(type === 'Instructor (external)'){
    return 'external Instructor';  // Is this a lecturer?
  } else if(type === 'Scientific Fellow'){
    return 'Scientific Fellow';
  } else if(type === 'Research Associate'){
    return 'Research Associate';
  } else if(type === 'Faculty (other)'){
    return 'sonstige Faculty';
  }

  //ADMIN & STAFF
  if(type === 'President & Vice President'){
    return 'President/Vice President';
  } else if(type === 'Director'){
    return 'Director';
  } else if(type === 'Assistant'){
    return 'Assistant';
  } else if(type === 'Technician'){
    return 'Technician';
  } else if(type === 'Staff (other)'){
    return 'Mitarbeiter sonstige';
  } else if(type === 'Intern'){
    return 'Praktikant';
  }

  if(type === 'Temporary'){
    return 'Temporary Access';
  }

  return type;
}

function parseEmployeeType(type){

  // STUDENTS
  if(type === 'Student'){
    return ['Student', 'student'];
  } else if(type === 'Gueststudent'){
    return ['Student (guest)', 'student'];
  } else if(type === 'Exchange Student'){
    return ['Student (exchange)', 'student'];
  } else if(type === 'external Student'){
    return ['Student (external)', 'student'];
  } else if(type === 'Visiting Student'){
    return ['Student (visiting)', 'student'];
  } else if(type === 'Teaching Assistant'){
    return ['Teaching Assistant', 'student'];
  } else if(type === 'Research Assistant'){
    return ['Research Assistant', 'student'];
  }

  //FACULTY
  if(type === 'Professor'){
    return ['Professor', 'faculty'];
  } else if(type === 'Visiting Professor'){
    return ['Professor (Visiting)', 'faculty'];
  } else if(type === 'Adjunct Professor'){
    return ['Professor (Adjunct)', 'faculty'];
  } else if(type === 'Lecturer'){
    return ['Lecturer', 'faculty'];
  } else if(type === 'University Lecturer'){
    return ['Lecturer (University)', 'faculty'];
  } else if(type === 'Further Lecturer'){
    return ['Lecturer (other)', 'faculty'];
  } else if(type === 'external Instructor'){
    return ['Instructor (external)', 'faculty'];  // Is this a lecturer?
  } else if(type === 'Scientific Fellow'){
    return ['Scientific Fellow', 'researcher'];
  } else if(type === 'Research Associate'){ //not faculty
    return ['Research Associate', 'researcher'];
  } else if(type === 'sonstige Faculty'){
    return ['Faculty (other)', 'faculty'];
  }

  //ADMIN & STAFF
  if(type === 'President/Vice President'){
    return ['President & Vice President', 'admin'];
  } else if(type === 'Director'){
    return ['Director', 'admin'];
  } else if(type === 'Assistant'){
    return ['Assistant', 'admin'];
  } else if(type === 'Technician'){
    return ['Technician', 'admin'];
  } else if(type === 'Mitarbeiter sonstige'){
    return ['Staff (other)', 'admin'];
  } else if(type === 'Praktikant'){
    return ['Intern', 'admin'];
  }

  if(type === 'Temporary Access'){
    return ['Temporary', ''];
  }

  return '';
}
