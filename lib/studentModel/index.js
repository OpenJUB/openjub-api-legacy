// we want to magic.
var async = require('async');
var winston = require('winston');

// a specific component
var sourceComponents = module.exports.sourceComponents = [];

// the schema
var schema = module.exports.schema = {};
var schemaKeys = module.exports.schemaKeys = [];

var completion = module.exports.completions = {};
var completionKeys = module.exports.completionKeys = [];

// parsers for different fields.
var sourceParsers = [];
var sourceGenerators = [];
var joinGenerators = [];

// parsers for runtime.
var runTimeParsers = [];

/**
 * Registers a new parser.
 */
var registerParser = function(parser){

  // the source fields.
  var sourceFields = parser.needs || [];

  // add the ones we do not yet need.
  sourceFields.map(function(e, idx){
    if(sourceComponents.indexOf(e) === -1){
      sourceComponents.push(e);
    }
  });

  // the schema
  var Schema = parser.schema || {};

  // mix it into the global schema.
  for(var key in Schema){
    if(Schema.hasOwnProperty(key)){
      schema[key] = Schema[key];
      schemaKeys.push(key);
    }
  }

  // the completion
  var Completion = parser.completions || {};

  // mix it into the global completion
  for(var key in Completion){
    if(Completion.hasOwnProperty(key)){
      completion[key] = Completion[key];
      completionKeys.push(key);
    }
  }

  // generate a source parser.
  sourceParsers.push(parser.parse);
  sourceGenerators.push(parser.unparse);
  joinGenerators.push(parser.join);

  // runtime parser
  var runTimeParser = parser.runtime;

  // if there is no runtime parser, provide one.
  if(typeof runTimeParser === 'function'){
    // store the runtime parser
    runTimeParsers.push(runTimeParser);
  }


};

var runImporter = module.exports.runImporter = function(obj, next){
  var warnings = 0;

  var warn = function(msg){
    warnings++;
    winston.log('warn', msg);
  };

  async.map(
    sourceParsers,
    function(parser, dNext){
      return parser.call(this, obj, dNext, warn);
    },
    function(err, res){

      if(err){
        next(err, null);
        return;
      }

      // create a new obj
      var mappedObj = {};

      // and extend it with all the stuff that was returned.
      res.map(function(e, idx){
        for(var k in e){
          if(e.hasOwnProperty(k)){
            mappedObj[k] = e[k];
          }
        }
      });

      // and finally return the mapped obj.
      async.setImmediate(function(){
        next(null, mappedObj, warnings);
      });
    }
  );
};

var runRuntime = module.exports.runRunTime = function(obj, req, res, next){
  var warnings = 0;

  var warn = function(msg){
    warnings++;
    winston.log('warn', msg);
  };

  async.map(
    runTimeParsers,
    function(runtime, rNext){
      return runtime.call(this, obj, req, res, rNext);
    },
    function(err, res){
      if(err){
        next(err, null);
        return;
      }

      // create a new obj
      var mappedObj = obj;

      // and extend it with all the stuff that was returned.
      res.map(function(e, idx){
        for(var k in e){
          if(e.hasOwnProperty(k)){
            mappedObj[k] = e[k];
          }
        }
      });

      // and finally return the mapped obj.
      async.setImmediate(function(){
        next(null, mappedObj, warnings);
      });
    }
  );
};

var unParse = module.exports.unParse = function reParse(obj, next){
  var warnings = 0;

  var warn = function(msg){
    warnings++;
    winston.log('warn', msg);
  };

  async.map(
    sourceGenerators,
    function(parser, dNext){
      return parser.call(this, obj, dNext, warn);
    },
    function(err, res){

      if(err){
        next(err, null);
        return;
      }

      // create a new obj
      var mappedObj = {};

      // and extend it with all the stuff that was returned.
      res.map(function(e, idx){
        for(var k in e){
          if(e.hasOwnProperty(k)){
            mappedObj[k] = e[k];
          }
        }
      });

      next(null, mappedObj, warnings);
    }
  );
};

var reParse = module.exports.reParse = function reParse(obj, next){
  unParse(obj, function(err, mappedObj){
    if(err){
      next(err, null);
      return;
    }

    runImporter(mappedObj, next);
  });
};

var autoJoiner = function(propName, emptyName, dictA, dictB){
  if(typeof emptyName !== 'string'){
    dictB = dictA;
    dictA = emptyName;
    emptyName = '';
  }

  var propA = dictA[propName];
  var propB = dictB[propName];

  if(typeof propA === 'undefined'){
    propA = emptyName;
  }

  if(typeof propB === 'undefined'){
    propB = emptyName;
  }

  if(propA === emptyName && propB === emptyName){
    return '';
  } else if(propA === emptyName){
    return propB;
  } else if(propB === emptyName){
    return propA;
  } else {
    if((''+propA).length > (''+propB).length){
      return propA;
    } else {
      return propB;
    }
  }
}

var joinLDAPs = module.exports.joinLDAP = function(ldapA, ldapB, next){
  async.map(
    joinGenerators,
    function(joiner, jNext){
      return joiner.call(this, autoJoiner, ldapA, ldapB, jNext);
    },
    function(err, res){

      if(err){
        next(err, null);
        return;
      }

      // create a new obj
      var mappedObj = {};

      // and extend it with all the stuff that was returned.
      res.map(function(e, idx){
        for(var k in e){
          if(e.hasOwnProperty(k)){
            mappedObj[k] = e[k];
          }
        }
      });
      next(null, mappedObj);
    }
  );
};

var runJoin = module.exports.runJoin = function(objects, next){

  if(objects.length < 2){
    next(new Error('Can not join more than one object. '), null);
    return;
  }

  // first unparse them.
  async.map(
    objects,
    unParse,
    function(err, ldaps){

      if(err){
        next(err, null);
        return;
      }

      async.reduce(
        ldaps.slice(1), ldaps[0],
        joinLDAPs,
        function(err, joinedLDAP){
          if(err){
            next(err, null);
            return;
          }
          runImporter(joinedLDAP, next);
        }
      )
    }
  )
};

var fields = module.exports.fields = function fields(f){

  var fieldArray;

  if(!Array.isArray(f)){
    fieldArray = (f || '').split(/(\s|,)/g);
  } else {
    fieldArray = f;
  }
  
  var fs = fieldArray.filter(function(e, idx){
    var e = e.trim();
    return schemaKeys.indexOf(e) !== -1;
  });

  if(fs.length === 0){
    return schemaKeys;
  }

  return fs;
};


// register a bunch of Schemas
registerParser(require('./components/base'));
registerParser(require('./components/name'));
registerParser(require('./components/country'));
registerParser(require('./components/college'));
registerParser(require('./components/contact'));
registerParser(require('./components/type'));
registerParser(require('./components/status'));
