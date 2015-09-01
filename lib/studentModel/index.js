// we want to magic.
var async = require('async');
var winston = require('winston');

// a specific component
var sourceComponents = module.exports.sourceComponents = [];

// the schema
var schema = module.exports.schema = {};
var schemaKeys = module.exports.schemaKeys = [];

// parsers for different fields.
var sourceParsers = [];
var sourceGenerators = []; 

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

  // generate a source parser.
  sourceParsers.push(parser.parse);
  sourceGenerators.push(parser.unparse); 

  // runtime parser
  var runTimeParser = parser.runtime;

  // if there is no runtime parser, provide one.
  if(typeof runTimeParser === 'function'){
    // store the runtime parser
    runTimeParsers.push(runTimeParser);
  }


};

var warn = function(msg){
  winston.log('warn', msg);
};

var runImporter = module.exports.runImporter = function(obj, next){
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
        next(null, mappedObj);
      });
    }
  );
};

var runRuntime = module.exports.runRunTime = function(obj, req, res, next){
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
        next(null, mappedObj);
      });
    }
  );
};

var reParse = function(obj, next){
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

      // and finally return the mapped obj.
      async.setImmediate(function(){
        runImporter(mappedObj, next); 
      });
    }
  );
}

var fields = module.exports.fields = function fields(f){

  // fields to find.
  var fs =
  (f || '')
  .split(/(\s|,)/g)
  .filter(function(e, idx){
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
