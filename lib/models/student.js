'use strict';

var settings = require('../settings');

/**
* Model for a student in the database.
* @param {mongoose} mongoose Mongoose instance.
* @param {class} Schema Schema class.
* @function models.student
*/
module.exports = function (mongoose, Schema) {
  var StudentModel; 
  
  var Student = new Schema({
    
    // Names
    fullName: {
      type: String,
      required: true
    },
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    
    // ids
    eid: {
      type: String,
      required: true
    },
    
    // username, email, phone
    email: {
      type: String
    },
    username: {
      type: String,
      required: true
    },
    phone: {
      type: String
    },
    
    // status
    type: {
      type: String
    },
    description: {
      type: String
    },
    status: {
      type: String
    },
    
    // academic info
    major: {
      type: String
    },
    majorShort: {
      type: String
    },
    year: {
      type: String
    },
    
    // country, college & room
    country: {
      type: String
    },
    college: {
      type: String
    },
    room: {
      type: String
    }
  });
  
  Student.statics.allFields = function(){
    return [
      'fullName', 'firstName', 'lastName', 'email', 'username', 'phone', 'type', 'description', 'status', 'major', 'majorShort', 'year', 'country', 'college', 'room'
    ];
  }; 
  
  var getFields = function(fields, showRealFields){
    // get all the fields
    var allFields = StudentModel.allFields(); 
    
    // read either a string or an array
    var theFields = [];
    
    if(typeof fields === 'string'){
      theFields = fields.split(','); 
    } else if(typeof fields !== 'undefined'){
      theFields = fields.slice(0);  
    }
    
    // make sure the Fields are seperated. 
    theFields = theFields
      .map(function(e){
        return e.trim(); 
      }); 
    
    // make sure dependencies are satisfied. 
    if(showRealFields && theFields.indexOf('picture') !== -1){
      theFields.push('username'); 
    }
    
    if(showRealFields && theFields.indexOf('flag') !== -1){
      theFields.push('country'); 
    }
    
    // filter nonexistent fields. 
    theFields = theFields
      .filter(function(e){
        return allFields.indexOf(e) !== -1; 
      }); 
    
    // if we have no fields, return all of them. 
    if(theFields.length === 0){
      return showRealFields?allFields.concat(['eid']):allFields.concat(['eid', 'picture', 'flag']); 
    }
    
    theFields.push('eid'); 
    return theFields; 
  };
  
  Student.statics.resolveFields = function(fields){
    return getFields(fields, true); 
  }; 
  
  Student.methods.getObjectFields = function(fields){
    return getFields(fields, false); 
  }; 
  
  Student.methods.toRealObject = function(requestPrefix, requestSuffix, fields){
    var retObj = {}; 
    var me = this; 
    
    // iterate over the real fields. 
    (Student.methods.getObjectFields(fields)).map(function(e){
      retObj[e] = me[e]; 
      
      if(e === 'picture'){
        retObj[e] = (requestPrefix || '') + retObj[e] + (requestSuffix || ''); 
      }
      
      if(e === 'flag'){
        retObj[e] = (requestPrefix || '') + retObj[e]; 
      }
    }); 
    
    return retObj;
  }; 

  Student.virtual('picture').get(function () {
    return '/user/image/'+this.username+'/image.jpg';
  });

  Student.virtual('flag').get(function () {
    return '/flags/'+this.country.replace(' ', '_')+'.png';
  });

  StudentModel = mongoose.model('Student', Student);
  return StudentModel;
};
