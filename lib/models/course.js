'use strict';

/**
* Model for a course.
* @param {mongoose} mongoose Mongoose instance.
* @param {class} Schema Schema class.
* @function models.course
*/
module.exports = function (mongoose, Schema) {
  var Course = new Schema({
    name: {
      type: String,
      required: true
    },
    number: {
      type: String,
      required: true
    }
  });

  var CourseModel = mongoose.model('Course', Course);
  return CourseModel;
};
