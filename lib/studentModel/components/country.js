module.exports.needs = ['extensionAttribute5'];

module.exports.schema = {
  'country': String,
  'flag': String,
  'image': String
};

module.exports.completions = {
  'country': ['Afghanistan', 'Albania', 'Algeria', 'American Samoa', 'Andorra', 'Angola', 'Anguilla', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Aruba', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bermuda', 'Bhutan', 'Bolivia', 'Bosnia', 'Botswana', 'Brazil', 'British Virgin Islands', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Cayman Islands', 'Central African Republic', 'Chad', 'Chile', 'China', 'Christmas Island', 'Colombia', 'Comoros', 'Cook Islands', 'Costa Rica', 'Côte d\'Ivoire', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominican Republic', 'Dominica', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Falkland Islands', 'Faroe Islands', 'Fiji', 'Finland', 'France', 'French Polynesia', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Gibraltar', 'Greece', 'Greenland', 'Grenada', 'Guam', 'Guatemala', 'Guinea Bissau', 'Guinea', 'Guyana', 'Haiti', 'Honduras', 'Hong Kong', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macao', 'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Martinique', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Montserrat', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands Antilles', 'Netherlands', 'New Zealand', 'Nicaragua', 'Nigeria', 'Niger', 'Niue', 'Norfolk Island', 'North Korea', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Pitcairn Islands', 'Poland', 'Portugal', 'Puerto Rico', 'Qatar', 'Republic of the Congo', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Pierre', 'Saint Vicent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tomé and Príncipe', 'Sao Tomé and Príncipe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Soloman Islands', 'Somalia', 'South Africa', 'South Georgia', 'South Korea', 'Soviet Union', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Swaziland', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Tibet', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Turks and Caicos Islands', 'Tuvalu', 'UAE', 'Uganda', 'Ukraine', 'United Kingdom', 'Uruguay', 'USA', 'US Virgin Islands', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Wallis and Futuna', 'Yemen', 'Zambia', 'Zimbabwe']
}; 

module.exports.parse = function(obj, next, warn){

  // prepare result and account name.
  var result = {};

  var username = obj.sAMAccountName;
  while(username.length<=20){
    username += ' ';
  }

  result.country = obj.extensionAttribute5 || '';
  result.flag = '/flags/'+result.country.replace(' ', '_')+'.png';
  result.image = '/user/image/'+obj.sAMAccountName+'/image.jpg'

  if(obj.active && !result.country){
    // TODO: Take care of missing countries.
    // not sure what to do here though
    // warn(username+': Active User without a country. ');
  }

  next(null, result);
};

module.exports.runtime = function(parsed, req, res, next){

  next(null, {

    // Country is as-is
    'country': parsed.country,

    // Image and flag have post-fixes
    'image': (req.prefix || '')+parsed.image+(req.suffix || ''),
    'flag': (req.prefix || '')+parsed.flag

  });
};

module.exports.unparse = function(data, next){
  next(null, {
    'extensionAttribute5': data.country
  });
};

module.exports.join = function(auto, ldapA, ldapB, next){
  next(null, {
    'extensionAttribute5': auto('extensionAttribute5', ldapA, ldapB)
  }); 
};
