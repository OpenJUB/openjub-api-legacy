/**
 * errors.js
 *
 * Defines all possible errors as an array of HTTP code and JSON that should be send.
 * Also defines the respective ErrorStructure for the API Doc
 */

'use strict';

// ================================
// 400 Errors
// ================================

/**
 * @apiDefineErrorStructure InvalidAuthentication
 * @apiError InvalidAuthentication Invalid Username or Password
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "InvalidAuthentication"
 *     }
 */
exports.InvalidAuthentication = [400, {
  'error': 'InvalidAuthentication'
}];

/**
 * @apiDefineErrorStructure InvalidRequest
 * @apiError InvalidRequest Invalid Parameters sent
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "InvalidRequest"
 *     }
 */
exports.InvalidRequest = [400, {
  'error': 'InvalidRequest'
}];

/**
 * @apiDefineErrorStructure EmptyUsernameOrPassword
 * @apiError EmptyUsernameOrPassword Empty Username or Password
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "EmptyUsernameOrPassword"
 *     }
 */
exports.EmptyUsernameOrPassword = [400, {
  'error': 'EmptyUsernameOrPassword'
}];

// ================================
// 404 Errors
// ================================

/**
 * @apiDefineErrorStructure UserNotFound
 * @apiError UserNotFound No records for this username
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "UserNotFound"
 *     }
 */
exports.InvalidAuthentication = [404, {
  'error': 'UserNotFound'
}];

/**
 * @apiDefineErrorStructure RequestNotFound
 * @apiError RequestNotFound Endpoint does not exist
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "RequestNotFound"
 *     }
 */
exports.RequestNotFound = [404, {
  'error': 'RequestNotFound'
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
exports.DatabaseProblem = [500, {
  'error': 'DatabaseProblem'
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
exports.UnknownError = [500, {
  'error': 'UnknownError'
}];




