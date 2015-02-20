'use strict';

/**
* Defines all possible errors as an array of HTTP code and JSON that should be send.
* @namespace errors
*/

// ================================
// 400 Errors
// ================================

/**
 * @apiDefine InvalidAuthentication
 * @apiError InvalidAuthentication Invalid Username or Password.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "InvalidAuthentication"
 *     }
 */

/**
* Invalid Username or Password.
* @type object
* @static
* @name errors.InvalidAuthentication
*/
exports.InvalidAuthentication = [400, {
  'error': 'InvalidAuthentication'
}];

/**
 * @apiDefine AlreadyAuthenticated
 * @apiError AlreadyAuthenticated Client is already authenticated and should logout first.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "AlreadyAuthenticated"
 *     }
 */

/**
* Client is already authenticated and should logout first.
* @type object
* @static
* @name errors.AlreadyAuthenticated
*/
exports.AlreadyAuthenticated = [400, {
  'error': 'AlreadyAuthenticated'
}];

/**
 * @apiDefine InvalidRequest
 * @apiError InvalidRequest Invalid Parameters sent.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "InvalidRequest"
 *     }
 */

 /**
 * Invalid Parameters sent.
 * @type object
 * @static
 * @name errors.InvalidRequest
 */
exports.InvalidRequest = [400, {
  'error': 'InvalidRequest'
}];

// ================================
// 404 Errors
// ================================

/**
 * @apiDefine UserNotFound
 * @apiError UserNotFound No records for this username.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "UserNotFound"
 *     }
 */

 /**
 * No records for this username.
 * @type object
 * @static
 * @name errors.UserNotFound
 */
exports.UserNotFound = [404, {
  'error': 'UserNotFound'
}];

/**
 * @apiDefine RequestNotFound
 * @apiError RequestNotFound Endpoint does not exist.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "RequestNotFound"
 *     }
 */

 /**
 * Endpoint does not exist.
 * @type object
 * @static
 * @name errors.RequestNotFound
 */
exports.RequestNotFound = [404, {
  'error': 'RequestNotFound'
}];

/**
 * @apiDefine TokenNotFound
 * @apiError TokenNotFound Token was not found.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "TokenNotFound"
 *     }
 */

 /**
 * Token was not found.
 * @type object
 * @static
 * @name errors.TokenNotFound
 */
exports.TokenNotFound = [404, {
  'error': 'TokenNotFound'
}];


// ================================
// 500 Errors
// ================================

/**
 * @apiDefine DatabaseProblem
 * @apiError DatabaseProblem A problem occured when communicating with the DB
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "DatabaseProblem"
 *     }
 */

 /**
 * A problem occured when communicating with the DB.
 * @type object
 * @static
 * @name errors.DatabaseProblem
 */
exports.DatabaseProblem = [500, {
  'error': 'DatabaseProblem'
}];

/**
 * @apiDefine UnknownError
 * @apiError UnknownError An unknown problem on the server occured
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "UnknownError"
 *     }
 */

 /**
 * An unknown problem on the server occured.
 * @type object
 * @static
 * @name errors.UnknownError
 */
exports.UnknownError = [500, {
  'error': 'UnknownError'
}];
