'use strict';

var Controllers = require('./controllers')();

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

  // ================================
  // Login Routes
  // ================================

  /**
  * @apiDefine auth
  * @apiParam (GET) {string} [token] Token from the current session. Not needed when the openjub_session cookie is available.
  * @apiParam (COOKIE) {string} [openjub_session] Session cookie containing a logged in session. If not given, the GET parameter token is mandatory.
  */

  /**
   * @api {get} /auth/isoncampus On Campus location
   * @apiDescription Check it the request in On or Off Campus.
   * @apiGroup Authentication
   *
   * @apiVersion 0.1.0
   * @apiSuccess {String} on_campus Is the user on or off campus?
   *
   * @apiSuccessExample Success-Response
   *    HTTP/1.1 200 OK
   *    {
   *      "on_campus": true
   *    }
   */
  app.get('/auth/isoncampus', Controllers.Auth.checkCampus);

  /**
   * @api {post} /auth/signin CampusNet Authentication
   * @apiDescription Login with CampusNet details.
   * @apiGroup Authentication
   *
   * @apiParam {String} username CampusNet/LDAP username
   * @apiParam {String} password CampusNet/LDAP password
   *
   * @apiSuccess {String} token Login Token
   * @apiSuccess {String} user Username
   *
   * @apiVersion 0.1.0
   * @apiUse InvalidRequest
   * @apiUse InvalidAuthentication
   * @apiUse AlreadyAuthenticated
   *
   * @apiSuccessExample Success-Response
   *    HTTP/1.1 200 OK
   *    {
   *      "token": "<token>",
   *      "user": "ex.ample"
   *    }
   */
  app.post('/auth/signin', Controllers.Auth.signin);

  /**
   * @api {get} /auth/signout Signout
   * @apiDescription Logout of a session.
   * @apiGroup Authentication
   *
   * @apiSuccess {Boolean} success indicating if the logout was successfull.
   *
   * @apiVersion 0.1.0
   * @apiUse auth
   * @apiUse TokenNotFound
   * @apiUse UnknownError
   *
   * @apiSuccessExample Success-Response
   *    HTTP/1.1 200 OK
   *    {
   *      "success": true
   *    }
   */
  app.get('/auth/signout', Controllers.Auth.need, Controllers.Auth.signout);

  /**
   * @api {post} /auth/status Login Status
   * @apiDescription If logged in, check the login status.
   * @apiGroup Authentication
   *
   * @apiSuccess {String} token Login Token
   * @apiSuccess {String} user Username or False when using on-Campus authentication.
   *
   * @apiVersion 0.1.0
   * @apiUse auth
   * @apiUse TokenNotFound
   * @apiUse InvalidRequest
   *
   * @apiSuccessExample Success-Response
   *    HTTP/1.1 200 OK
   *    {
   *      "token": "<token>",
   *      "user": "ex.ample"
   *    }
   */
  app.get('/auth/status', Controllers.Auth.need, Controllers.Auth.status);

  // ================================
  // Getting info about a single user
  // ================================

  /**
   * @api {get} /user/me Get info about the current user.
   * @apiDescription Get info about the current user
   * @apiGroup Users
   *
   * @apiParam (GET) {String[]} [fields] Fields to return. Defaults to all fields.
   *
   * @apiVersion 0.1.0
   * @apiUse auth
   * @apiUse TokenNotFound
   * @apiUse InvalidRequest
   * @apiUse UserNotFound
   *
   * @apiSuccessExample Success-Response
   *    HTTP/1.1 200 OK
   *    {
   *      "token": "<token>",
   *      "user": "ex.ample"
   *    }
   */
  app.get('/user/me', Controllers.Auth.need, Controllers.User.me);

  /**
   * @api {get} /user/name/:username Get info about a user by username
   * @apiDescription Get info about a user by username
   * @apiGroup Users
   * @apiVersion 0.1.0
   *
   * @apiParam (GET) {String[]} [fields] Fields to return. Defaults to all fields.
   * @apiParam {String} username Username of user to get info about
   *
   * @apiUse auth
   * @apiUse TokenNotFound
   * @apiUse InvalidRequest
   * @apiUse UserNotFound
   *
   * @apiSuccessExample Success-Response
   *    HTTP/1.1 200 OK
   *    {
   *      "token": "<token>",
   *      "user": "ex.ample"
   *    }
   */
  app.get('/user/name/:username', Controllers.Auth.need, Controllers.User.username);

  /**
   * @api {get} /user/id/:id Get info about a user by id
   * @apiDescription Get info about a user by id
   * @apiGroup Users
   * @apiVersion 0.1.0
   *
   * @apiParam (GET) {String[]} [fields] Fields to return. Defaults to all fields.
   * @apiParam {String} id Id of user to get info about
   *
   * @apiUse auth
   * @apiUse TokenNotFound
   * @apiUse InvalidRequest
   * @apiUse UserNotFound
   *
   * @apiSuccessExample Success-Response
   *    HTTP/1.1 200 OK
   *    {
   *      "token": "<token>",
   *      "user": "ex.ample"
   *    }
   */
  app.get('/user/id/:id', Controllers.Auth.need, Controllers.User.id);


  //we're not a goat
  app.get('/user/me/isagoat', function(req, res){
    res.status(200).jsonp({
      "isAGoat": false
    });
  })

  // ================================
  // Searches
  // ================================

  /**
   * @api {get} /query/:q Quickly searches for a machine-readable query
   * @apiDescription Quickly searches for a machine-readable query
   * @apiGroup Searcg
   * @apiVersion 0.1.0
   *
   * @apiParam (GET) {String[]} [fields] Fields to return. Defaults to all fields.
   * @apiParam (GET) {number} [limit] - Maximal number of entries to display
   * @apiParam (GET) {number} [skip] - Skip, number of entries to skip at the beginning
   *
   * @apiParam {String} q The query to search for
   *
   * @apiUse auth
   * @apiUse TokenNotFound
   * @apiUse InvalidRequest
   * @apiUse UserNotFound
   *
   * @apiSuccessExample Success-Response
   *    HTTP/1.1 200 OK
   *    [{
   *      "token": "<token>",
   *      "user": "ex.ample"
   *    }]
   */
  app.get('/query/:q', Controllers.Auth.need, Controllers.User.query);

  /**
   * @api {get} /search/:q Searches for a query
   * @apiDescription Searches for a query
   * @apiGroup Searcg
   * @apiVersion 0.1.0
   *
   * @apiParam (GET) {String[]} [fields] Fields to return. Defaults to all fields.
   * @apiParam (GET) {number} [limit] - Maximal number of entries to display
   * @apiParam (GET) {number} [skip] - Skip, number of entries to skip at the beginning
   *
   * @apiParam {String} q The query to search for
   *
   * @apiUse auth
   * @apiUse TokenNotFound
   * @apiUse InvalidRequest
   * @apiUse UserNotFound
   *
   * @apiSuccessExample Success-Response
   *    HTTP/1.1 200 OK
   *    [{
   *      "token": "<token>",
   *      "user": "ex.ample"
   *    }]
   */
  app.get('/search/:q', Controllers.Auth.need, Controllers.User.search);

  // ================================
  // Everything else
  // ================================

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
