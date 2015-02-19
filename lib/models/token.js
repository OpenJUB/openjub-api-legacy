'use strict';

/**
* Model for the user authentication token.
* @param {mongoose} mongoose Mongoose instance.
* @param {class} Schema Schema class.
* @function models.token
*/
module.exports = function (mongoose, Schema) {
  var Token = new Schema({
    user: {
      type: String,
      required: true
    },

    token: {
      type: String,
      required: true
    },

    createdAt: {
      type: Date,
      expires:'2m',
      required: true
    }
  });

  var TokenModel = mongoose.model('Token', Token);
  return TokenModel;
};
