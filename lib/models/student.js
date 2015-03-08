'use strict';

var settings = require('../../settings.json');

/**
* Model for a student in the database.
* @param {mongoose} mongoose Mongoose instance.
* @param {class} Schema Schema class.
* @function models.student
*/
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
    return '/user/image/'+this.username+'/image.jpg';
  });

  Student.virtual('flag').get(function () {
    return '/flags/'+this.country.replace(' ', '_')+'.png';
  });

  Student.set('toObject', { getters: true, virtuals: true });
  Student.set('toJSON', { getters: true, virtuals: true });

  var StudentModel = mongoose.model('Student', Student);
  return StudentModel;
};
