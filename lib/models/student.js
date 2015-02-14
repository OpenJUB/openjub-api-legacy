'use strict';

var settings = require('../../settings.json');

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
    },
    year: {
      type: String
    },
    majorShort: {
      type: String
    },
    status: {
      type: String
    },
    room: {
      type: String
    }

    // todo:
    // - room
    // - courses
  });

  Student.virtual('picture').get(function () {
    return settings.imageApiUrl.replace(':account', this.username);
  });

  Student.set('toObject', { getters: true, virtuals: true });
  Student.set('toJSON', { getters: true, virtuals: true });

  var StudentModel = mongoose.model('Student', Student);
  return StudentModel;
};
