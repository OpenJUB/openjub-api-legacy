var winston = require('winston');

var MongooseRoomModel = require('../../db/models').PhoneRoom;
var buildingsMapping = require('../../../data/buildings/mapping');

module.exports = function(next){
  winston.log('info', 'Reloading phone-room mapping, this might take a while. ');

  MongooseRoomModel
  .remove({}, function(){
    MongooseRoomModel.collection.insert(buildingsMapping, function(err, res){
      if(err){
        winston.log('error', 'Error updating phone-room mapping. ')
        winston.log('error', err.message);
        winston.log('error', 'Fatal error encountered, exiting. ');
        process.exit(1);
        return;
      }

      winston.log('info', 'Done updating. ');
      next(null, null);
    });
  });
};
