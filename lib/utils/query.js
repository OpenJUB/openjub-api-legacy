exports.parse = function (query) {
  query = query || '';
  conditionArray = query.match(/[^\s]*:[^\s]*/g);
  fullNameQuery = query.replace(/[^\s]*:[^\s]*/g, '').replace(/\s+/g, ' ').trim();

  var conditions = {};
  if(conditionArray && Array.isArray(conditionArray)) {
    for (var i = 0; i < conditionArray.length; i++) {
      var pos = conditionArray[i].indexOf(':');
      var field = conditionArray[i].substr(0, pos);
      var q = conditionArray[i].substr(pos+1);
      var qArray = q.split(',');
      if (qArray.length > 1) {
        var valueArray = [];
        for (var j = 0; j < qArray.length; j++) {
          try {
            valueArray.push(new RegExp(qArray[j], 'i'));
          } catch (err) {}
        }
        conditions[field] = {$in: valueArray};
      } else {
        try {
          conditions[field] = new RegExp(q, 'i');
        } catch (err) {
          //
        }
      }
    }
  }
  try {
    conditions.fullName = new RegExp(fullNameQuery, 'i');
  } catch (err) {
    //
  }

  return conditions;
};