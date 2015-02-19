'use strict';

/**
* Defines all possible errors as an array of HTTP code and JSON that should be send.
* @namespace errors
*/

// ================================
// 400 Errors
// ================================

/**
 * @apiDefineErrorStructure InvalidAuthentication
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
 * @apiDefineErrorStructure InvalidRequest
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

/**
 * @apiDefineErrorStructure EmptyUsernameOrPassword
 * @apiError EmptyUsernameOrPassword Empty Username or Password were provided.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "EmptyUsernameOrPassword"
 *     }
 */

 /**
 * Empty Username or Password were provided.
 * @type object
 * @static
 * @name errors.EmptyUsernameOrPassword
 */
exports.EmptyUsernameOrPassword = [400, {
  'error': 'EmptyUsernameOrPassword'
}];

// ================================
// 401 Errors
// ================================

/**
 * @apiDefineErrorStructure NotOnCampus
 * @apiError NotOnCampus User Reqeust does not originate on campus.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "error": "NotOnCampus"
 *     }
 */

 /**
 * Reqeust does not originate on campus.
 * @type object
 * @static
 * @name errors.NotOnCampus
 */
exports.NotOnCampus = [401, {
  'error': 'NotOnCampus'
}];

/**
 * @apiDefineErrorStructure NoTokenSpecified
 * @apiError NoTokenSpecified No token was specified.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "error": "NoTokenSpecified"
 *     }
 */

 /**
 * No token was specified.
 * @type object
 * @static
 * @name errors.NoTokenSpecified
 */
exports.NoTokenSpecified = [401, {
  'error': 'NoTokenSpecified'
}];


// ================================
// 404 Errors
// ================================

/**
 * @apiDefineErrorStructure UserNotFound
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
 * @apiDefineErrorStructure RequestNotFound
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
 * @apiDefineErrorStructure TokenNotFound
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
 * @apiDefineErrorStructure DatabaseProblem
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
 * @apiDefineErrorStructure TokenProblem
 * @apiError TokenProblem Failed to decode Token.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "TokenProblem"
 *     }
 */

 /**
 * Failed to decode Token.
 * @type object
 * @static
 * @name errors.TokenProblem
 */
exports.TokenProblem = [401, {
  'error': 'TokenProblem'
}];

/**
 * @apiDefineErrorStructure UnknownError
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
