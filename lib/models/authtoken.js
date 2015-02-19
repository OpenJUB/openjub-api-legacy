'use strict';

/**
* Model for the user authentication token.
* @param {mongoose} mongoose Mongoose instance.
* @param {class} Schema Schema class. 
* @function models.authtoken
*/
module.exports = function (mongoose, Schema) {
  var AuthToken = new Schema({
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

  var AuthTokenModel = mongoose.model('AuthToken', AuthToken);
  return AuthTokenModel;
};
