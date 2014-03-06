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
    },
    fullName: {
      type: String,
      required: true
    },
    eid: {
      type: String,
      required: true
    },
    type: {
      type: String
    },
    email: {
      type: String
    },
    username: {
      type: String,
      required: true
    },
    major: {
      type: String
    },
    country: {
      type: String
    },
    description: {
      type: String
    },
    phone: {
      type: String
    },
    college: {
      type: String
    }

    // todo:
    // - room
    // - courses
  });

  var StudentModel = mongoose.model('Student', Student);
  return StudentModel;
};
