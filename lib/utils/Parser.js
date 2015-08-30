(function(Parser){

  /**
   * Parses a query string into a list
   * of search terms and fields. 
   * @function
   */
  var parse = Parser.parse = function parse(str){
    // get the tokens from the string.
    var tokens = tokenize(str);

    var token;

    var mode = '';
    var modeKey = '';

    var data = {};
    var search = [];

    // todo: parse into key, value, normal.
    for(var i=0;i<tokens.length;i++){
      token = tokens[i];

      if(mode === ''){
        if(token.type === 'string' || token.type === 'string\'' || token.type === 'string"'){
          // push search string. 
          search.push(token.value);
        } else if(token.type === 'regexp'){
          // regular expression not allowed in search string mode. 
          throw new Error('Parse Error: Unexpected Regular Expression in Range ['+token.range[0]+','+token.range[1]+']');
        }
      } else {
        // push strings && regexes into the current search key. 
        if(token.type === 'string' || token.type === 'string\'' || token.type === 'string"'){
          data[modeKey].push(token.value);
        } else if(token.type === 'regexp'){
          data[modeKey].push(token.value);
        }
      }

      if(token.type === 'key'){
        mode = 'key';
        modeKey = token.value;

        // make sure we have an array for the given key.
        if(!data.hasOwnProperty(modeKey)){
          data[modeKey] = [];
        }
      }
    }

    return {
      'data': data,
      'search': search
    };
  };
  
  var getTokenAt = Parser.getTokenAt = function getTokenAt(str, position){
    
    // tokenise the string. 
    var tokens = tokenize(str); 
    var _token = undefined;
    
    // find the current position. 
    for(var i=0;i<tokens.length;i++){
      _token = tokens[i]; 
      
      // if the current character is in the range. 
      if(_token.range[0] <= position && _token.range[1] >= position){
        break; 
      }
    }
    
    // return that token. 
    return _token; 
  }; 
  
  var completeToken = Parser.completeToken = function completeToken(tokens, index, completions){
    // TODO: Find all the keys in the token. 
    // TODO: For the current token, fin 
    
    
    return [{
      "completion": undefined, 
      "range": token.range
    }]; 
  }
  
  /**
   * Tokenises a search string. 
   * @function
   */
  var tokenize = Parser.tokenize = function tokenize(str){
    // start at position 0
    var idx = 0;

    // all the tokens we have
    // and the last token also.
    var tokens = [];
    var lastToken;

    // keep scanning tokens
    // from the string.
    while(idx < str.length){
        lastToken = scanToken(str, idx);
        lastToken.index = tokens.length; 
        idx = lastToken.nextIndex;
        tokens.push(lastToken);
    }

    return tokens;
  };
  
  /**
   * Scans for the next token starting from a given position. 
   * @function
   */
  var scanToken = Parser.scanToken = function scanToken(str, idx){
    var char;
    var _idx = idx;
    var match;

    while(idx < str.length){
      char = str[idx];

      // if it is a space, a 
      // so we just ignore it.
      if(char.match(/(\s|,|;)/) ){
        idx++;
        continue;
      }

      // if is a " => make it a string with "s
      if(char == '"' || char === '\''){
          return scanStringToken(str, idx+1, char);
      }

      // is a / => make it a regex
      if(char === '/'){
        return scanRegExToken(str, idx+1);
      }

      // find the next space, : or $
      match = /(\s|,|;|:|$)/.exec(str.substring(idx));

      if(match[1] === ':'){
        // it is a string key.
        return {
          'value': str.substring(idx, idx + match.index),
          'range': [_idx - 1, idx + match.index],
          'nextIndex': idx + match.index + 1,
          'type': 'key'
        };
      } else {
        // it is a raw string.
        return {
          'value': str.substring(idx, idx + match.index),
          'range': [_idx - 1, idx + match.index],
          'nextIndex': idx + match.index + 1,
          'type': 'string'
        };
      }
    }

    // we have nothing to do.
    return {
      'type': 'none',
      'range': [_idx - 1, str.length - 1],
      'nextIndex': -1
    };
  };
  
/**
 * Scans for a quotes string token from a given position. 
 * @function
 */
  var scanStringToken = Parser.scanStringToken = function scanStringToken(str, idx, quote){
    var escape = '\\';
    var _idx = idx;
    var val = '';
    
    
    for(;idx<str.length;idx++){
      
      // handle escapes
      if(str[idx] === escape){
        idx++;
        
      // scan for the next quote and exit. 
      } else if(str[idx] === quote){
        return {
          'value': val,
          'range': [_idx - 1, idx],
          'nextIndex': idx+1,
          'type': 'string'+quote
        }
      }

      val += str[idx] || '';
    }

    // in case it fails, just return a string. 
    return {
      'value': val,
      'range': [_idx - 1, str.length - 1],
      'type': 'string',
    };

  };

  var scanRegExToken = Parser.scanRegExToken = function scanRegExToken(str, idx){
    var terminator = '/';
    var _idx = idx;
    var val = '';
    
    
    for(;idx<str.length;idx++){
      
      // find the next possible terminator
      // and see if it is a valid regex. 
      if(str[idx] === terminator){
          try {
              return {
                'value': new RegExp(val),
                'range': [_idx - 1, idx],
                'nextIndex': idx+1,
                'type': 'regexp',
                'error': null
              }
          } catch(e){}
      }
      
      val += str[idx] || '';
    }
    
    // in case of failure
    // just return it as a string. 
    return {
      'value': val,
      'range': [_idx - 1, str.length - 1],
      'nextIndex': str.length,
      'type': 'string'
    };

  };
})(
  (function(){
    // check if we are in node or in the browser. 
    
    var Parser = new Object(); 
    if(typeof module !== 'undefined' && module.exports){
      module.exports = Parser; 
    } else {
      window.Parser = Parser; 
    }
    return Parser; 
  })()
); 