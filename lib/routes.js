'use strict';

var User = require('./controllers/user.js');

module.exports = function (app) {

  /**
   * @api {post} /authenticate Authenticates User
   * @apiName Authenticate
   * @apiGroup User
   *
   * @apiParam {username} CampusNet/LDAP username
   * @apiParam {password} CampusNet/LDAP password
   *
   * @apiSuccess {String} token Generated Access Token
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "token": "asdlfkjklj12kjlkasdjf1"
   *     }
   *
   * @apiError InvalidAuthentication Invalid Username or Password
   * @apiErrorExample Error-Response:
   *     HTTP/1.1 400 Bad Request
   *     {
   *       "error": "InvalidAuthentication"
   *     }
   */
  app.get('/authenticate', User.auth);
};
