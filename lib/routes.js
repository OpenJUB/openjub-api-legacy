'use strict';

var Controllers = require('./controllers')();
var Middleware = require('./middleware');

/**
* Routing definitions.
* @namespace routes
*/

/**
* Registers all API routes available
* @param {express} app - Application to register API routes with.
* @function routes.route
*/
module.exports.route = function (app) {
  /**
   * @api {get} /auth/checkcampus Check on-campus status
   * @apiVersion 0.1.0
   * @apiName Check On-Campus Status
   * @apiGroup Authantication
   *
   * @apiSuccess {String} on_campus true | false
   * @apiSuccessExample Success-Response
   *    HTTP/1.1 200 OK
   *    {
   *      "on_campus": true
   *    }
   */
  app.get('/auth/checkcampus', Controllers.Auth.checkCampus);

  /**
   * @api {post} /auth/login Login as a specific user
   * @apiVersion 0.1.0
   * @apiName Login as a campusnet user.
   * @apiGroup Authentication
   *
   * @apiParam {String} username CampusNet/LDAP username
   * @apiParam {String} password CampusNet/LDAP password
   *
   * @apiErrorStructure InvalidRequest
   *
   * @apiSuccessExample Success-Response
   *    HTTP/1.1 200 OK
   *    {
   *      "token": "<token>"
   *    }
   */
  app.post('/auth/login', Controllers.Auth.login);
  return;


  /**
   * @api {get} /auth/oncampus On-Campus Access Token
   * @apiVersion 0.0.1
   * @apiName On-Campus Access Token
   * @apiGroup Authentication
   *
   *
   * @apiSuccess {String} token Generated Access Token
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "token": "asdlfkjklj12kjlkasdjf1"
   *     }
   *
   * @apiErrorStructure NotOnCampus
   * @apiErrorStructure InvalidRequest
   */
  app.get('/auth/oncampus', Controllers.Auth.onCampus);

  // Currently Undocumented
  app.get('/login', Controllers.Auth.login);

  // Currently Undocumented
  app.get('/auth/callback', Controllers.Auth.callback);

  /**
   * @api {post} /auth Authenticates User
   * @apiVersion 0.0.1
   * @apiName Authenticate
   * @apiGroup Authentication
   *
   * @apiParam {String} username CampusNet/LDAP username
   * @apiParam {String} password CampusNet/LDAP password
   * @apiParam {String} response_type code || token
   * @apiParam {String} redirect_uri URI redirected to after log-in attempt
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 301 Moved Permanently
   *
   * @apiErrorStructure DatabaseProblem
   * @apiErrorStructure InvalidRequest
   * @apiErrorStructure EmptyUsernameOrPassword
   */
  app.post('/auth', Controllers.Auth.auth);

  /**
   * @api {post} /token Retrieves Token
   * @apiVersion 0.0.1
   * @apiName Access Token
   * @apiGroup Authentication
   *
   * @apiParam {String} code Authentication Code
   *
   * @apiSuccess {String} token Generated Access Token
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "token": "asdlfkjklj12kjlkasdjf1"
   *     }
   *
   * @apiErrorStructure TokenNotFound
   */
  app.get('/token', Controllers.Auth.token);

  /**
   * @api {get} /user Retrieves Users
   * @apiVersion 0.0.1
   * @apiName Retrieves Users
   * @apiGroup User
   *
   * @apiParam {String} fields Comma-separated list of fields that should be returned for each user
   * @apiParam {String} q Query to filter users
   * @apiParam {Number} limit Number of elements on one page
   * @apiParam {Number} skip Number of elements that should be skipped
   *
   * @apiSuccess {Array} data Array of all matched users
   * @apiSuccess {String} next Link to next page (if pagination used through 'limit')
   * @apiSuccess {String} prev Link to next page (if pagination used through 'limit')
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "data": [
   *       {
   *         "firstName": "Simon",
   *         "lastName": "Omething",
   *         "eid": "999999",
   *         "type": "Student",
   *         "email": "s.omething@jacobs-university.de",
   *         "username": "something",
   *         "major": "Computer Science",
   *         "country": "Amazing Country",
   *         "description": "ug 14 CS"
   *       }
   *       ],
   *       "next": "",
   *       "prev": ""
   *     }
   *
   * @apiErrorStructure DatabaseProblem
   * @apiErrorStructure NoTokenSpecified
   * @apiErrorStructure TokenProblem
   */
  app.get('/user', Middleware.checkToken, Controllers.User.get);

  app.get('/user/me', Middleware.checkToken, Controllers.User.me);

  app.post('/user/me/favorite/:action', Middleware.checkToken, Controllers.User.actionFavorite);

  app.get('/user/autocomplete', Middleware.checkToken, Controllers.User.autocomplete);

  /**
   * @api {get} /user/:account Find By Account
   * @apiVersion 0.0.1
   * @apiName Find By Account
   * @apiGroup User
   *
   * @apiParam {String} fields Comma-separated list of fields that should be returned for each user
   *
   * @apiSuccess {Object} User Info
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "firstName": "Simon",
   *       "lastName": "Omething",
   *       "eid": "999999",
   *       "type": "Student",
   *       "email": "s.omething@jacobs-university.de",
   *       "username": "something",
   *       "major": "Computer Science",
   *       "country": "Amazing Country",
   *       "description": "ug 14 CS"
   *     }
   *
   * @apiErrorStructure InvalidRequest
   * @apiErrorStructure DatabaseProblem
   * @apiErrorStructure NoTokenSpecified
   * @apiErrorStructure TokenProblem
   */
  app.get('/user/:account', Middleware.checkToken, Controllers.User.getByAccount);

  // Currently Undocumented
  app.get('/user/eid/:eid/image.jpg', Middleware.checkToken, Controllers.User.getImageByEid);
  // Currently Undocumented
  app.get('/user/:account/image.jpg', Middleware.checkToken, Controllers.User.getImageByAccount);

  /**
   * @api {get} /user/eid/:eid Find By Eid
   * @apiVersion 0.0.1
   * @apiName Find By Eid
   * @apiGroup User
   *
   * @apiParam {String} fields Comma-separated list of fields that should be returned for each user
   *
   * @apiSuccess {Object} User Info
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "firstName": "Simon",
   *       "lastName": "Omething",
   *       "eid": "999999",
   *       "type": "Student",
   *       "email": "s.omething@jacobs-university.de",
   *       "username": "something",
   *       "major": "Computer Science",
   *       "country": "Amazing Country",
   *       "description": "ug 14 CS"
   *     }
   *
   * @apiErrorStructure InvalidRequest
   * @apiErrorStructure DatabaseProblem
   * @apiErrorStructure NoTokenSpecified
   * @apiErrorStructure TokenProblem
   */
  app.get('/user/eid/:eid', Middleware.checkToken, Controllers.User.getById);

  app.get('/flag/:country/image.png', Middleware.checkToken, Controllers.User.getCountryFlag);

  app.get('/course', Middleware.checkToken, Controllers.Course.get);
  app.get('/course/:number', Middleware.checkToken, Controllers.Course.getByNumber);

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
