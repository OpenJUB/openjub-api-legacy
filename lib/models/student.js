'use strict';

module.exports = function (mongoose, Schema) {
  var Student = new Schema({
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    }
  });

  var StudentModel = mongoose.model('Student', Student);
  return StudentModel;
};
