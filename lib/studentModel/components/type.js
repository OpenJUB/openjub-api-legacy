module.exports.needs = ['employeeType'];

module.exports.schema = {
  'type': [{type: 'String', enum: ['']}], 
  'isStudent': Boolean, 
  'isFaculty': Boolean, 
  'isStaff': Boolean
};  

module.exports.parse = function(obj, next, warn){

  var username = obj.sAMAccountName;
  while(username.length<=20){
    username += ' '; 
  } 
  
  var isStudent = false; 
  var isFaculty = false;  
  var isStaff = false; 
  
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
    if(typeGroup === 'staff'){
      isStaff = true; 
    }
    
    
    // add the type if we do not yet have it. 
    if(types.indexOf(typeName) === -1){
      types.push(typeName)
    }
    
  })
  
  next(null, {
    'type': types, 
    'isStudent': isStudent, 
    'isFaculty': isFaculty, 
    'isStaff': isStaff
  }); 
};

module.exports.unparse = function(data, next){
  next(null, {
    'employeeType': data.type.map(unparseEmployeeType).join(';')
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
    return ['Scientific Fellow', 'faculty'];
  } else if(type === 'Research Associate'){
    return ['Research Associate', 'faculty'];
  } else if(type === 'sonstige Faculty'){
    return ['Faculty (other)', 'faculty'];
  }
  
  //ADMIN & STAFF
  if(type === 'President/Vice President'){
    return ['President & Vice President', 'staff'];
  } else if(type === 'Director'){
    return ['Director', 'staff'];
  } else if(type === 'Assistant'){
    return ['Assistant', 'staff'];
  } else if(type === 'Technician'){
    return ['Technician', 'staff'];
  } else if(type === 'Mitarbeiter sonstige'){
    return ['Staff (other)', 'staff'];
  } else if(type === 'Praktikant'){
    return ['Intern', 'staff'];
  }

  if(type === 'Temporary Access'){
    return ['Temporary', ''];
  }
  
  return ''; 
}