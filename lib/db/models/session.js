'use strict';

/**
* Model for a user session in the database.
* @param {mongoose} mongoose Mongoose instance.
* @param {class} Schema Schema class.
* @function models.session
*/
module.exports = function (mongoose, Schema) {
  var Session = new Schema({
    user: {
      type: String,
      required: true
    },

    createdAt: {
      type: Date,
      required: true
    }, 
    
    touchedAt: {
      type: Date,
      expires: '1d', 
      required: true
    }
  });

  var SessionModel = mongoose.model('Session', Session);
  return SessionModel;
};
