'use strict';

/**
* Model for phone <-> room mappings.
* @param {mongoose} mongoose Mongoose instance.
* @param {class} Schema Schema class.
* @function models.phoneRoom
*/
module.exports = function (mongoose, Schema) {
  var PhoneRoom = new Schema({
    phone: {
      type: String,
      required: true
    },
    room: {
      type: String,
      required: true
    }
  });

  var PhoneRoomModel = mongoose.model('PhoneRoom', PhoneRoom);
  return PhoneRoomModel;
};
