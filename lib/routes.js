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
  * @apiDefine auth Authentication
  * @apiParam (GET) {string} [token] Token from the current session. Not needed when the openjub_session cookie is available.
  * @apiParam (COOKIE) {string} [openjub_session] Session cookie containing a logged in session. If not given, the GET parameter token is mandatory.
  */

  /**
   * @api {get} /login/isoncampus On Campus location
   * @apiDescription Check it the request in On or Off Campus.
   * @apiGroup Login
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
  app.get('/login/isoncampus', Controllers.Login.checkCampus);

  /**
   * @api {post} /login/signin CampusNet Authentication
   * @apiDescription Login with CampusNet details.
   * @apiGroup Login
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
  app.post('/login/signin', Controllers.Login.signin);

  /**
   * @api {get} /login/signout Signout
   * @apiDescription Logout of a session.
   * @apiGroup Login
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
  app.get('/login/signout', Controllers.Login.need, Controllers.Login.signout);

  /**
   * @api {post} /login/status Login Status
   * @apiDescription If logged in, check the login status.
   * @apiGroup Login
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
  app.get('/login/status', Controllers.Login.need, Controllers.Login.status);


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
