'use strict';

var User = require('./controllers/user.js');

module.exports = function (app) {

  /**
   * @api {post} /authenticate Authenticates User
   * @apiVersion 0.0.1
   * @apiName Authenticate
   * @apiGroup User
   *
   * @apiParam {String} username CampusNet/LDAP username
   * @apiParam {String} password CampusNet/LDAP password
   *
   * @apiSuccess {String} token Generated Access Token
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "token": "asdlfkjklj12kjlkasdjf1"
   *     }
   *
   * @apiErrorStructure InvalidAuthentication
   */
  app.post('/authenticate', User.auth);


  app.get('/*', function (req, res) {
    res.errorJson('RequestNotFound');
  });
  app.post('/*', function (req, res) {
    res.errorJson('RequestNotFound');
  });
  app.put('/*', function (req, res) {
    res.errorJson('RequestNotFound');
  });
  app.delete('/*', function (req, res) {
    res.errorJson('RequestNotFound');
  });
};
