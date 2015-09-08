(function(Parser){

  /**
   * A parsed query.
   * @typedef {Object} JUB.Parser~query
   * @property {object} data - A key-value object mapping search Terms to queries of string and regexes.
   * @property {String[]|RegExp[]} search - An array of search terms
   */

  /**
  * A parsed token.
  * @typedef {Object} JUB.Parser~token
  * @property {string|RegExp} value - The value of the token
  * @property {string} type - The type of token. One of 'none', 'key', 'string_raw', 'string'' or 'string"'
  * @property {number} contentIndex - The index of the original string where the input starts.
  * @property {number[]} range - The range of text this token is contained in.
  * @property {string} raw_value - The raw string representing this token.
  */

  /**
   * A directory of autocompletions.
   * @typedef {Object} JUB.Parser~completions
   * @property {number} startIndex - The index the completions start at.
   * @property {string} name - The name of the current context. One of '' and 'key'.
   * @property {string[]} completions - An array containing possible completions.
   */

  /**
  * An autocompletion context.
  * @typedef {Object} JUB.Parser~context
  * @property {string} value - The type of the current context. One of '' and 'key'.
  * @property {boolean} valueFirst - Indicates if values of the current context should be completed first.
  * @property {JUB.Parser~Token} token - The token representing the current context.
  * @property {number} start - The position where this context starts.
  */

  /**
   * Parses a query string into a list
   * of search terms and fields.
   * @param {string} str - String to parse
   * @returns {JUB.Parser~query} - the parsed query.
   * @function JUB.Parser.parse
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


  /**
   * Gets the autocompletion context of a string.
   * @function JUB.Parser.getContext
   * @param {string} str - The string to get the context from.
   * @return {JUB.Parser~context}
   */
  var getContext = Parser.getContext = function getContext(str){

    // tokenise the string
    var tokens = tokenize(str);

    var _token = undefined;
    var tokenState = 0;
    var context = '';

    // find the current position.
    for(var i=0;i<tokens.length;i++){
      _token = tokens[i];

      if(_token.type === 'key'){
        tokenState = 0;
        context = _token.value;
      } else if(tokenState === 0){
        tokenState = 1;
      } else {
        tokenState = 2;
      }
    }

    // we have a comma at the end, we always want more values.
    if(str.trim()[str.trim().length - 1] === ','){
      tokenState = 0;
    }

    if(_token.type === 'key' && _token.raw_value[_token.raw_value.length - 1] === ':'){
      return {
        'value': context,
        'valueFirst': tokenState !== 2,
        'token': _token,
        'start': _token.range[1]
      }
    }

    // return the current context
    return {
      'value': context,
      'valueFirst': tokenState !== 2,
      'token': _token,
      'start': _token.contextIndex
    }
  };

  /**
   * Escapes a string.
   * @function JUB.Parser.escapeString
   * @private
   * @param {string} str - The string to escape.
   * @param {string} [markHint] - The quote to escape with (optional).
   * @return {string}
   */
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

  /**
   * Autocompletes a string.
   * @function JUB.Parser.complete
   * @param {string} str - String to autocomplete.
   * @param {object} completions - An object containing possible key/value pairs to complete with.
   * @param {number} maxCompletions - The maximal number of completions to return.
   * @return {JUB.Parser~completions}
   */
  var complete = Parser.complete = function complete(str, completions, maxCompletions){
    // tokenise and get the token Index
    var context = getContext(str);
    var _completions = [];

    var _keyCompletions = [];
    var possibleCompletions;
    var escapeToken = false;

    var subCompletionString = str.substring(context.start);

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
        if(context.valueFirst){
          _completions.push(key+': ');
        } else {
          _completions.unshift(key+': ');
        }
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
   * @function JUB.Parser.tokenize
   * @param {string} str - String to tokenise
   * @return {JUB.Parser~token[]} - A list of tokens.
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
   * Scans for the next token.
   * @function JUB.Parser.scanToken
   * @param {string} str - String to scan.
   * @param
   * @return {JUB.Parser~token} - The next token.
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
 /**
  * Scans for the next token.
  * @function JUB.Parser.scanToken
  * @param {string} str - String to scan.
  * @return {JUB.Parser~token} - The next token.
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
