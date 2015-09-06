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
          // push regular expression
          search.push(token.value);
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
  
  var getContext = Parser.getContext = function getTokenAt(str){
    
    // tokenise the string
    // if it is not already an array. 
    if(Array.isArray(str)){
      var tokens = str; 
    } else {
      var tokens = tokenize(str); 
    }
    
    var _token = undefined;
    var context = ''; 
    
    // find the current position. 
    for(var i=0;i<tokens.length;i++){
      _token = tokens[i]; 
      
      if(_token.type === 'key'){
        context = _token.value;
      }
    }
    
    if(_token.type === 'key' && _token.raw_value[_token.raw_value.length - 1] === ':'){
      return {
        'value': context, 
        'token': _token, 
        'start': _token.range[1]
      } 
    }
        
    // return the current context
    return {
      'value': context, 
      'token': _token, 
      'start': _token.contextIndex
    } 
  }; 
  
  var escapeString = function escapeString(str, markHint){
    var needsEscaping = (str.match(/[:,\s]/g) || []).length > 1;
    
    if(needsEscaping || markHint){
      
      var escapeChar; 
      
      if(markHint){
        escapeChar = markHint; 
      } else {
        var singleMark = (str.match(/'/g) || []).length;
        var doubleMark = (str.match(/'/g) || []).length;
        
        if(singleMark > doubleMark){
          escapeChar = '"';
        } else {
          escapeChar = '\''; 
        }

      }
      return escapeChar+str.replace(new RegExp(escapeChar, 'g'), '\\'+escapeChar)+escapeChar;       
    } else {
      return str; 
    }
  }; 
  
  var complete = Parser.complete = function complete(str, completions, maxCompletions){
    // tokenise and get the token Index
    var tokens = tokenize(str); 
    var context = getContext(tokens); 
    
    var _keyCompletions = []; 
    var possibleCompletions; 
    var escapeToken = false; 
    
    var subCompletionString = context.substring(context.start); 
    
    if(context.token.raw_value[0] === '\''){
      escapeToken = '\''; 
    } else if(context.token.raw_value[0] === '"'){
      escapeToken = '"'; 
    }
    
    // if we are in key mode, try to complete the values
    if(context.value !== ''){
      possibleCompletions = completions[context.value]; 
      
      if(Array.isArray(possibleCompletions)){
        for(var i=0;i<possibleCompletions.length;i++){
          _completions.push(escapeString(possibleCompletions[i].toString(), escapeToken)+' '); 
        }
      }
    }
    
    // push all the other completion keys
    for(var key in completions){
      if(completions.hasOwnProperty(key)){
        _completions.push(key+': '); 
      }
    }
    
    // if we have too many things, 
    // we want to remove those that do not match
    // and then slice. 
    if(_completions.length > maxCompletions){
      _completions = _completions.filter(function(e){
        return e.indexOf(subCompletionString) === 0;
      }).splice(0, maxCompletions); 
    }
    
    return {
      'startIndex': context.start, // we start at the current index. 
      'name': context.value, 
      'completions': _completions
    }; 
  }; 
  
  /**
   * Tokenises a search string. 
   * @function
   */
  var tokenize = Parser.tokenize = function tokenize(str){
    
    // for the empty string
    // return the none token
    if(str === ''){
      return [{
        'type': 'none',
        'contextIndex': 0, 
        'range': [0, 0],
        'raw_value': '', 
      }];
    }
    
    // start at position 0
    var idx = 0;

    // all the tokens we have
    // and the last token also.
    var tokens = [];
    var lastToken;

    // keep scanning tokens
    // from the string.
    while(idx < str.length && idx !== -1){
        lastToken = scanToken(str, idx);
        lastToken.raw_value = str.slice(lastToken.range[0], lastToken.range[1]); 
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
    var cIndex = _idx; 
    var match;

    while(idx < str.length){
      char = str[idx];
      
      // if we are at the end of the string
      // and we only had spaces before
      if(!char){
        break; 
      }
      
      // if it is a space, a 
      // so we just ignore it.
      if(char.match(/(\s|,|;)/)){
        cIndex++; 
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
          'range': [_idx, idx + match.index + 1],
          'contextIndex': cIndex, 
          'nextIndex': idx + match.index + 1,
          'type': 'key'
        };
      } else {
        // it is a raw string.
        return {
          'value': str.substring(idx, idx + match.index),
          'range': [_idx, idx + match.index+1],
          'contextIndex': cIndex,
          'nextIndex': idx + match.index,
          'type': 'string'
        };
      }
    }
    
    // there were only spaces
    // or commas
    // => the current context begins at the end. 
    return {
      'type': 'none',
      'range': [str.length - 1, str.length - 1],
      'contextIndex': str.length,
      'nextIndex': str.length
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
          'contextIndex': _idx - 1,
          'nextIndex': idx+1,
          'type': 'string'+quote
        }
      }

      val += str[idx] || '';
    }

    // in case it fails, just return a string. 
    return {
      'value': val,
      'range': [_idx -1 , str.length],
      'contextIndex': _idx - 1,
      'nextIndex': str.length, 
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
                'contextIndex': _idx - 1,
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
      'range': [_idx - 1, str.length],
      'contextIndex': _idx - 1, 
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