'use strict';

var Controllers = require('../controllers');

var path = require('path');
var rootPath = path.normalize(__dirname + '/../../..');

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
  * @apiParam (GET) {String} [token] Token from the current session. Not needed when the openjub_session cookie is available.
  * @apiParam (COOKIE) {String} [openjub_session] Session cookie containing a logged in session. If not given, the GET parameter token is mandatory.
  */

  /**
   * @api {get} /auth/isoncampus On Campus location
   * @apiDescription Check it the request in On or Off Campus.
   * @apiGroup Authentication
   *
   * @apiVersion 0.2.2
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
   * @apiVersion 0.2.2
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
   * @apiVersion 0.2.2
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
   * @apiVersion 0.2.2
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
   * @api {get} /user/me Get info about the current user
   * @apiDescription Get info about the current user
   * @apiGroup Users
   *
   * @apiParam (GET) {String[]} [fields] Fields to return. Defaults to all fields.
   *
   * @apiVersion 0.2.2
   * @apiUse auth
   * @apiUse TokenNotFound
   * @apiUse InvalidRequest
   * @apiUse UserNotFound
   *
   * @apiSuccessExample Success-Response
   *    HTTP/1.1 200 OK
   *     {
   *      "eid":"39126",
   *      "active":true,
   *
   *      "email":"l.kuboschek@jacobs-university.de",
   *      "username":"lkuboschek",
   *
   *      "fullName":"Leonhard Kuboschek",
   *      "firstName":"Leonhard",
   *      "lastName":"Kuboschek",
   *
   *      "country":"Germany",
   *      "flag":"http://localhost:6969/flags/Germany.png",
   *      "picture":"http://localhost:6969/user/image/lkuboschek/image.jpg",
   *
   *      "college":"Nordmetall",
   *      "phone":"6210",
   *      "isCampusPhone":true,
   *      "room":"NB-351",
   *      "type":["Student"],
   *
   *      "isStudent":true,
   *      "isFaculty":false,
   *      "isStaff":false,
   *
   *      "status":"undergrad",
   *      "year": "17",
   *      "majorShort":"CS",
   *      "major":"Computer Science",
   *      "description":"ug 17 CS"
   *     }
   */
  app.get('/user/me', Controllers.Auth.need, Controllers.User.me);

  /**
   * @api {get} /user/name/:username Get info about a user by username
   * @apiDescription Get info about a user by username
   * @apiGroup Users
   * @apiVersion 0.2.2
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
   *     {
   *      "eid":"39126",
   *      "active":true,
   *
   *      "email":"l.kuboschek@jacobs-university.de",
   *      "username":"lkuboschek",
   *
   *      "fullName":"Leonhard Kuboschek",
   *      "firstName":"Leonhard",
   *      "lastName":"Kuboschek",
   *
   *      "country":"Germany",
   *      "flag":"http://localhost:6969/flags/Germany.png",
   *      "picture":"http://localhost:6969/user/image/lkuboschek/image.jpg",
   *
   *      "college":"Nordmetall",
   *      "phone":"6210",
   *      "isCampusPhone":true,
   *      "room":"NB-351",
   *      "type":["Student"],
   *
   *      "isStudent":true,
   *      "isFaculty":false,
   *      "isStaff":false,
   *
   *      "status":"undergrad",
   *      "year": "17",
   *      "majorShort":"CS",
   *      "major":"Computer Science",
   *      "description":"ug 17 CS"
   *     }
   */
  app.get('/user/name/:username', Controllers.Auth.need, Controllers.User.username);

  /**
   * @api {get} /user/id/:id Get info about a user by id
   * @apiDescription Get info about a user by id
   * @apiGroup Users
   * @apiVersion 0.2.2
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
   *  {
   *    "data":[{
   *      "eid":"39126",
   *      "active":true,
   *
   *      "email":"l.kuboschek@jacobs-university.de",
   *      "username":"lkuboschek",
   *
   *      "fullName":"Leonhard Kuboschek",
   *      "firstName":"Leonhard",
   *      "lastName":"Kuboschek",
   *
   *      "country":"Germany",
   *      "flag":"http://localhost:6969/flags/Germany.png",
   *      "picture":"http://localhost:6969/user/image/lkuboschek/image.jpg",
   *
   *      "college":"Nordmetall",
   *      "phone":"6210",
   *      "isCampusPhone":true,
   *      "room":"NB-351",
   *      "type":["Student"],
   *
   *      "isStudent":true,
   *      "isFaculty":false,
   *      "isStaff":false,
   *
   *      "status":"undergrad",
   *      "year": "17",
   *      "majorShort":"CS",
   *      "major":"Computer Science",
   *      "description":"ug 17 CS"
   *    }],
   *    "count":1,
   *    "next":false,
   *    "prev":false
   *  }
   */
  app.get('/user/id/:id', Controllers.Auth.need, Controllers.User.id);

  /**
   * @api {get} /user/image/:account/image.jpg Get the image of a user
   * @apiDescription Get the image of a user
   * @apiGroup Users
   * @apiVersion 0.2.2
   *
   * @apiParam {String} account User to display image for
   *
   * @apiUse auth
   * @apiUse TokenNotFound
   * @apiUse InvalidRequest
   * @apiUse UserNotFound
   */
  app.get('/user/image/:account/image.jpg', Controllers.Auth.need, Controllers.User.image);

  /**
   * @api {get} /user/me/isagoat Goat status
   * @apiDescription Check if the user is a goat.
   * @apiGroup Users
   *
   * @apiVersion 0.2.2
   * @apiSuccess {String} is_a_goat Is the user a goat?
   *
   * @apiSuccessExample Success-Response
   *    HTTP/1.1 200 OK
   *    {
   *      "is_a_goat": true
   *    }
   */
  app.get('/user/me/isagoat', function(req, res){
    res.status(200).jsonp({
      'is_a_goat': false
    });
  });

  // ================================
  // Searches
  // ================================

  /**
   * @api {get} /query/:q Quickly searches for a machine-readable query
   * @apiDescription Quickly searches for a machine-readable query
   * @apiGroup Search
   * @apiVersion 0.2.2
   *
   * @apiParam (GET) {String[]} [fields] Fields to return. Defaults to all fields.
   * @apiParam (GET) {Number} [limit] - Maximal number of entries to display
   * @apiParam (GET) {Number} [skip] - Skip, number of entries to skip at the beginning
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
   *  {
   *    "data":[{
   *      "eid":"39126",
   *      "active":true,
   *
   *      "email":"l.kuboschek@jacobs-university.de",
   *      "username":"lkuboschek",
   *
   *      "fullName":"Leonhard Kuboschek",
   *      "firstName":"Leonhard",
   *      "lastName":"Kuboschek",
   *
   *      "country":"Germany",
   *      "flag":"http://localhost:6969/flags/Germany.png",
   *      "picture":"http://localhost:6969/user/image/lkuboschek/image.jpg",
   *
   *      "college":"Nordmetall",
   *      "phone":"6210",
   *      "isCampusPhone":true,
   *      "room":"NB-351",
   *      "type":["Student"],
   *
   *      "isStudent":true,
   *      "isFaculty":false,
   *      "isStaff":false,
   *
   *      "status":"undergrad",
   *      "year": "17",
   *      "majorShort":"CS",
   *      "major":"Computer Science",
   *      "description":"ug 17 CS"
   *    }],
   *    "count":1,
   *    "next":false,
   *    "prev":false
   *  }
   */


  app.get('/query/:q', Controllers.Auth.need, Controllers.User.query);

  //Fallback to all when searching for nothing.
  app.get('/query/', Controllers.Auth.need, Controllers.User.all);

  /**
   * @api {get} /autocomplete/ Provides autocompletion data
   * @apiDescription Provides autocompletion data
   * @apiGroup Search
   * @apiVersion 0.2.2
   */
  app.get('/autocomplete/', Controllers.User.autocomplete);

  /**
   * @api {get} /search/:q Searches for a query
   * @apiDescription Searches for a query
   * @apiGroup Search
   * @apiVersion 0.2.2
   *
   * @apiParam (GET) {String[]} [fields] Fields to return. Defaults to all fields.
   * @apiParam (GET) {Number} [limit] - Maximal number of entries to display
   * @apiParam (GET) {Number} [skip] - Skip, number of entries to skip at the beginning
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
   *  {
   *    "data":[{
   *      "eid":"39126",
   *      "active":true,
   *
   *      "email":"l.kuboschek@jacobs-university.de",
   *      "username":"lkuboschek",
   *
   *      "fullName":"Leonhard Kuboschek",
   *      "firstName":"Leonhard",
   *      "lastName":"Kuboschek",
   *
   *      "country":"Germany",
   *      "flag":"http://localhost:6969/flags/Germany.png",
   *      "picture":"http://localhost:6969/user/image/lkuboschek/image.jpg",
   *
   *      "college":"Nordmetall",
   *      "phone":"6210",
   *      "isCampusPhone":true,
   *      "room":"NB-351",
   *      "type":["Student"],
   *
   *      "isStudent":true,
   *      "isFaculty":false,
   *      "isStaff":false,
   *
   *      "status":"undergrad",
   *      "year": "17",
   *      "majorShort":"CS",
   *      "major":"Computer Science",
   *      "description":"ug 17 CS"
   *    }],
   *    "count":1,
   *    "next":false,
   *    "prev":false
   *  }
   */
  app.get('/search/:q', Controllers.Auth.need, Controllers.User.search);

  // ================================
  // Login GUI
  // ================================

    /**
     * @api {get} /view/login Graphical login page, step 1
     * @apiDescription Callback Graphical login page, step 1
     * @apiGroup Authentication GUI
     * @apiVersion 0.2.2
     * @apiParam (GET) {String} id  Optional. ID that can be used client side to identify the request.
     * @apiParam (GET) {String} redirect_url URL to redirect to after login. Get parameters "token" and "id" will be appended automatically. If omitted uses JavaScripts window.postMessage to send back data to the opening window.
     */
     app.get('/view/login', Controllers.Auth.view_login_init);

     /**
      * @api {post} /view/login Graphical login page, step 2
      * @apiDescription Callback Graphical login page, step 2
      * @apiGroup Authentication GUI
      * @apiVersion 0.2.2
      *
      * @apiParam (POST) {String} action Action to take. One of 'login', 'clear' and 'continue'.
      * @apiParam (POST) {String} username Username - Username to check.
      * @apiParam (POST) {String} password Password - Password to check.
      * @apiParam (POST) {String} id  Optional. ID that can be used client side to identify the request.
      * @apiParam (POST) {String} redirect_url URL to redirect to after login. Get parameters "token" and "id" will be appended automatically. If omitted uses JavaScripts window.postMessage to send back data to the opening window.
      */
      app.post('/view/login', Controllers.Auth.view_login_handler);


      /**
       * @api {get} /view/callback Graphical login page, step 3
       * @apiDescription Graphical login page, step 3
       * @apiGroup Authentication GUI
       * @apiVersion 0.2.2
       *
       * @apiParam (GET) {String} token The current token
       * @apiParam (GET) {String} id  Optional. ID that can be used client side to identify the request.
       * @apiParam (GET) {String} redirect_url URL to redirect to after login. Get parameters "token" and "id" will be appended automatically. If omitted uses JavaScripts window.postMessage to send back data to the opening window.
       */
       app.get('/view/callback', Controllers.Auth.view_login_final);

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
