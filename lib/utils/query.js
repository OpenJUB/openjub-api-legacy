
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
    conditions[result[1]] = new RegExp(escapeRegExp(result[2]).replace(", ", ",").split(",").join("|"), "i");
    result = noQuoteQuery.exec(query);
  }

  //go over single quotes => these just search with spaces.
  result = singleQuoteQuery.exec(query);
  while (result != null) {
    conditions[result[1]] = new RegExp(escapeRegExp(result[2]).replace(", ", ",").split(",").join("|"), "i");
    result = singleQuoteQuery.exec(query);
  }

  //go over double quotes => these just search exact matches (without case).
  result = doubleQuoteQuery.exec(query);
  while (result != null) {
    conditions[result[1]] = new RegExp("^"+escapeRegExp(result[2]).replace(", ", ",").split(",").join("|")+"$", "i");
    result = doubleQuoteQuery.exec(query);
  }



  //no go over the quoted results

  //parses a query.
  try {
    conditions.fullName = new RegExp(escapeRegExp(fullNameQuery).replace(" ", " ([\\w]+ )*"), 'i');
  } catch (err) {
    //
  }
  console.log(conditions);
  return conditions;
};
