'use strict';

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
