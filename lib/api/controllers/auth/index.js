'use strict';

var backend = require("./backend");
var url = require("url"); 

var session = require('./session');
var settings = require('../../../settings');
var jsonUtils = require('../../../utils/json');


/**
 * Controllers for authentication.
 * @namespace controllers.auth
 */
 
/**
* Checks if an ip-adress of a user is on campus.
* @param {request} req - Request object
* @param {response} res - Reponse object
*/
exports.checkCampus = function (req, res) {
  exports.read_auth_state(req, res, function(){
    res.jsonp({'on_campus': req.campus});
  }); 
};

/**
* Log in using CampusNet details.
* @param {request} req - Request object
* @param {response} res - Reponse object
* @function controllers.auth.signin
*/
exports.signin = function (req, res) {

  //check that we have username / password
  if (!req.body.username ||
      !req.body.password) {
    res.errorJson('InvalidRequest');
    return;
  }

  //try and decode a session
  session.decodeSession(req, function(hasSession){
    
    // we are already logged in
    if(hasSession){
      res.errorJson('AlreadyAuthenticated');
      return;
    }

    //extract the username and password
    var username = jsonUtils.ensureString(req.body.username, '');
    var password = jsonUtils.ensureString(req.body.password, '');

    //login to ldap
    backend.loginLDAP(username, password, function(user){
      
      // we did not login. 
      if(!user) {
        res.errorJson('InvalidAuthentication');
        return;
      }

      //try and create a session
      session.createSession(req, user, function(token){
        
        // set the cookie
        req.cookies.openjub_token = token;
        
        // refesh the auth state. 
        exports.refresh_auth_state(req, res, function(req, res){
          exports.status(req, res);
        }); 
      });
    });
  });
};

/**
* Logs out of a campusnet session.
* @param {request} req - Request object
* @param {response} res - Reponse object
* @function controllers.auth.signout
*/
exports.signout = function (req, res) {

  //parse the token we want to decode
  req.token = req.cookies.openjub_token || req.query.token;

  //try and decode a session
  session.decodeSession(req, function(hasSession){
    //we did not have a session.
    //so we can not logout.
    if(!hasSession){
      res.errorJson('TokenNotFound');
      return;
    }

    //destroy the session
    session.deleteSession(req, function(err){

      //something else happened
      //we can not do anything about it for now.
      if(err){
        res.errorJson('UnknownError');
        return;
      }

      //delete the cookie
      res.clearCookie('openjub_token');

      //We successfully logged out.
      res.status(200).jsonp({
        'success': true
      });
    });
  });
};

/**
* Reads the authentication state. 
* @param {request} req - Request object
* @param {result} res - Reponse object
* @param {function} next - Next thing to do.
*/
exports.read_auth_state = function(req, res, next){
  
  // request prefix
  req.prefix = req.protocol + '://' + req.get('host');
  req.suffix = ''; 
  
  // are we authorised to access protected methods?
  req.authorised = false;
  
  // in a normal case we just use the normal ip. 
  req.source_ip = req.ip; 
  
  // else we need the source ip. 
  if(req.ips.length > 1){
    req.source_ip = req.ips[req.ips.length - 2]; 
  }
  
  req.campus = backend.checkCampusIp(req.source_ip);
  
  
  // if we are on campus, we are authorised
  if(req.campus){
    req.authorised = true; 
  }
  
  // are we authenticated with a user account?
  req.authenticated = false; 
  req.user = null; 
  
  // what is our token?
  // TODO: Header?
  req.token = jsonUtils.ensureString(req.cookies.openjub_token || req.query.token, '');
  req.token_method = req.cookies.openjub_token?'cookie':'url'; 
  
  // if we do not have a token. 
  if(!req.token){
    req.token = null; 
    req.token_method = ''; 
    req.authenticated = false; 
    req.suffix = ''; 
    
    next(req, res); 
    return; 
  }
  
  // if we have a token, try to read it. 
  session.decodeSession(req, function(user){
    if(user){
      req.authorised = true; 
      req.authenticated = true; 
      req.user = user; 
    } else {
      req.authenticated = false; 
    }
    
    if(!req.campus){
      req.suffix = '?token='+req.token;
    }
    
    next(req, res);
  });
}; 

/**
* Refreshes the authentication state. 
* @param {request} req - Request object
* @param {result} res - Reponse object
* @param {function} next - Next thing to do.
*/
exports.refresh_auth_state = function(req, res, next){
  
  exports.read_auth_state(req, res, function(req, res){
    // if we authenticated using a cookie we want to re-set it. 
    if(req.token_method == 'cookie' && req.authenticated){
      res.cookie('openjub_token', req.cookies.openjub_token, { maxAge: settings.token.options.expiresInMinutes*1000*60, httpOnly: true });
    // if we are not authenticated, remove the cookie
    } else if(!req.authenticated){
      res.clearCookie('openjub_token'); 
    }
    
    next(req, res); 
  }); 
};

/**
* Clears the authentication state. 
* @param {request} req - Request object
* @param {result} res - Reponse object
* @param {function} next - Next thing to do.
*/
exports.clear_auth_state = function(req, res, next){
  
  exports.read_auth_state(req, res, function(req, res){
    session.deleteSession(req, function(){
      
      // clear the cookie
      res.clearCookie('openjub_token'); 
      
      // set all the properties
      req.authorised = req.campus; 
      
      req.authenticated = false; 
      req.user = null; 
      
      req.token = null; 
      req.token_method = ''; 
      
      next(req, res); 
    });
  });   
}

/**
* Checks if a user is authenticated.
* @param {request} req - Request object
* @param {result} res - Reponse object
* @param {function} next - Next thing to do.
*/
exports.need = function (req, res, next) {
  
  exports.refresh_auth_state(req, res, function(req, res){
    
    // if we are not authorised, we do not have a token. 
    if(!req.authorised){
      res.errorJson('TokenNotFound');
      return; 
    }
    
    next(); 
  }); 
};

/**
* Checks the status of a user.
* @param {request} req - Request object
* @param {result} res - Reponse object
*/
exports.status = function(req, res){
  //send the status to the user.
  exports.refresh_auth_state(req, res, function(req, res){
    res.status(200).jsonp({
      'user': req.user?req.user.username:false,
      'token': req.token
    });
  }); 
};

/**
* Initial callback for login. 
* @param {request} req - Request object
* @param {result} res - Reponse object
*/
exports.view_login_init = function(req, res){
  var id = req.query.id || '';
  var redirect_url = req.query.redirect_url || ''; 
  
  exports.read_auth_state(req, res, function(){
    if(req.authenticated){
      res.render('login_renew', {
        'id': id, 
        'redirect_url': redirect_url, 
        'suffix': req.suffix, 
        'user': req.user, 
      }); 
    } else {
      res.render('login', {
        'id': id, 
        'redirect_url': redirect_url, 
        'message': false,
      }); 
    }
  }); 
}; 

/**
* Second callback for login. 
* @param {request} req - Request object
* @param {result} res - Reponse object
*/
exports.view_login_handler = function(req, res){
  var action = req.body.action || ''; 
  
  var id = req.body.id || '';
  var redirect_url = req.body.redirect_url || ''; 
  
  var username = req.body.username || ''; 
  var password = req.body.password || ''; 
  
  if(action === 'login'){
    backend.loginLDAP(username, password, function(user){
      if(user){
        
        session.createSession(req, user, function(token){
          if(token){
            // store the token in a cookie
            req.cookies.openjub_token = token; 
            
            exports.refresh_auth_state(req, res, function(){
              res.redirect(url.format({
                pathname: '/view/callback', 
                query: {'id': id, 'token':token, 'redirect_url': redirect_url}
              })); 
            }); 
          } else {
            res.render('login', {
              'id': id || '', 
              'redirect_url': redirect_url, 
              'message': 'Unable to create session. Please try again later. ',
            });
          }
        }); 
        
      } else {
        res.render('login', {
          'id': id, 
          'redirect_url': redirect_url, 
          'message': 'Login failed. ',
        }); 
      }
    }); 
  } else if(action === 'clear'){
    exports.read_auth_state(req, res, function(){
      session.deleteSession(req, function(suc){
        exports.refresh_auth_state(req, res, function(){
          res.redirect(url.format({
            pathname:'/view/login', 
            query: {'id': id, 'redirect_url': redirect_url}
          })); 
        }); 
      }); 
    }); 
  } else if(action === 'continue'){
    exports.refresh_auth_state(req, res, function(){
      res.redirect(url.format({
        pathname:'/view/callback', 
        query: {'id': id, 'token':req.token, 'redirect_url': redirect_url}
      })); 
    }); 
  }
}; 

exports.view_login_final = function(req, res){
  var id = req.query.id || '';
  var redirect_url_str = req.query.redirect_url || ''; 
  var redirect_url = url.parse(redirect_url_str, true); 
  var token = req.query.token || req.token; 
  
  if(redirect_url_str === ''){
    res.render('login_post', {
      'id': id,
      'token': token
    }); 
  } else {
    redirect_url.query.id = id; 
    redirect_url.query.token = token; 
    res.redirect(url.format(redirect_url)); 
  }
}