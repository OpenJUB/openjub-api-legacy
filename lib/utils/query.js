
var
  allFields = ["firstName","lastName","major","majorShort","email","phone","room","college","country","year","status","username"]; //all possible fields


//build some Regexes
var noQuoteQuery = new RegExp("("+allFields.join("|")+"):\\s?([^\\s\\\"\\']+)", "gi");
var singleQuoteQuery = new RegExp("("+allFields.join("|")+"):\\s?'([^']+)'", "gi");
var doubleQuoteQuery = new RegExp("("+allFields.join("|")+'):\\s?"([^"]+)"', "gi");

function escapeRegExp(str) {
  //escapes a string for a regexp.
  //from: https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function escapeFullName(fullName){
  var names = fullName.replace("\\s+", " ").split(" ");
  names = names.map(function(e){
    return "(\\w+\\-)?"+e+"(\\-\\w+)?";
  });

  return names.join(" ([\\w]+ )*")
}

exports.parse = function (query) {
  var query = query || "";
  var result = null;
  var conditions = {};

  //find the full name query by just replaceing everything.
  var fullNameQuery = query
  .replace(noQuoteQuery, "")
  .replace(singleQuoteQuery, "")
  .replace(doubleQuoteQuery, "")
  .trim();

  //iterate over the noQuote Results
  result = noQuoteQuery.exec(query);
  while (result != null) {
    conditions[result[1]] = escapeRegExp(result[2]).replace(", ", ",").split(",").join("|");
    result = noQuoteQuery.exec(query);
  }

  //go over single quotes => these just search with spaces.
  result = singleQuoteQuery.exec(query);
  while (result != null) {
    conditions[result[1]] = escapeRegExp(result[2]).replace(", ", ",").split(",").join("|");
    result = singleQuoteQuery.exec(query);
  }

  //go over double quotes => these just search exact matches (without case).
  result = doubleQuoteQuery.exec(query);
  while (result != null) {
    conditions[result[1]] = "^"+escapeRegExp(result[2]).replace(", ", ",").split(",").join("|")+"$";
    result = doubleQuoteQuery.exec(query);
  }

  if(fullNameQuery.trim() != ""){
      //go over the full name if its on-empty
      conditions.fullName = escapeFullName(fullNameQuery);
  }

  return conditions;
};
