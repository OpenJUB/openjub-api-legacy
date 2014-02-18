'use strict';

exports.auth = function (req, res) {
  // do authentication here
  res.json({
    'token': 'blablabal'
  });

  return;
};
