'use strict';

module.exports = function (mongoose, Schema) {
  var Course = new Schema({
    name: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: true
    }
  });

  var CourseModel = mongoose.model('Course', Course);
  return CourseModel;
};