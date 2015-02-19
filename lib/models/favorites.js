'use strict';

var settings = require('../../settings.json');

/**
* Model for user favorites.
* @param {mongoose} mongoose Mongoose instance.
* @param {class} Schema Schema class.
* @function models.favorites
*/
module.exports = function (mongoose, Schema) {
  var Favorites = new Schema({
    user: {
      type: String,
      required: true
    },
    favorites: [String]
  });


  var FavoritesModel = mongoose.model('Favorites', Favorites);
  return FavoritesModel;
};
