'use strict';

var settings = require('../../settings.json');

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
