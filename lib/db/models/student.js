'use strict';

var settings = require('../../settings');
var studentModel = require('../../studentModel');

/**
* Model for a student in the database.
* @param {mongoose} mongoose Mongoose instance.
* @param {class} Schema Schema class.
* @function models.student
*/
module.exports = function (mongoose, Schema) {
  var StudentModel;

  var Student = new Schema(studentModel.schema);

  Student.methods.toRealObject = function(requestPrefix, requestSuffix, fields, next){

    var request = {
      'prefix': requestPrefix,
      'suffix': requestSuffix
    };

    // prepare response and json.
    var response = {};
    var self = this.toObject();

    studentModel.runRunTime(self, request, response, function(err, data){
      if(err){
        next(err, null);
        return;
      }

      var finalObj = {};

      var fields = studentModel.fields(fields);
      fields.map(function(k, idx){
        finalObj[k] = data[k];
      });

      next(null, finalObj);
    });
  };

  Student.virtual('picture').get(function () {
    return '/user/image/'+this.username+'/image.jpg';
  });

  StudentModel = mongoose.model('Student', Student);
  return StudentModel;
};
