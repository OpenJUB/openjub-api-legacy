// imports
var commander = require('commander');
var winston = require('winston');

// load the basics
var log = require('../log');
var settings = require('../settings');

// parse the command line arguments
commander
  .option('-d, --drop', 'Drops the entire database before sync. Only effictive with -s and -f. ')
  
  .option('-c, --cleanup', 'Cleans up the database and re-parses all documents. ')
  .option('-s, --sync-ldap', 'Syncronises the database with LDAP. Default. ')
  .option('-f, --sync-file [file]', 'Synchronises with the file FILE. ')
  .option('-l, --export-ldap [file]', 'Parses the LDAP database and store it into FILE. ')
  .option('-e, --export [file]', 'Exports the entire content of the database into FILE. ')
  
  .option('-u, --username [username]', 'Username for LDAP')
  .option('-p, --password [password]', 'Password for LDAP')
  
  .parse(process.argv);

// Check for muturally exclusive arguments. 
var shouldCleanup = commander.cleanup?1:0;
var shouldSync = commander.syncLdap?1:0;
var shouldSyncFile = commander.syncFile?1:0; 
var shouldExportLDAP = commander.exportLdap?1:0;
var shouldExport = commander.export?1:0; 

// count the number of arguments. 
var all = shouldCleanup + shouldSync + shouldSyncFile + shouldExportLDAP + shouldExport; 

// if there is more that one, die. 
if(all > 1){
  winston.log('error', 'only at most one of -c, -s, -f, -l, -e may be used. '); 
  winston.log('error', 'see --help for help. '); 
  process.exit(1); 
}

// if there is none, we should sync. 
if(all === 0){
  shouldSync = 1; 
}


// now switch mode. 
if(shouldCleanup){
  require('./modes/cleanup')(commander); 
} else if(shouldSync){
  require('./modes/sync_ldap')(commander); 
} else if(shouldSyncFile){
  require('./modes/sync_file')(commander); 
} else if(shouldExportLDAP){
  require('./modes/export_ldap')(commander); 
} else if(shouldExport){
  require('./modes/export_db')(commander); 
} else {
  console.log('Something went wrong. ')
  process.exit(0); 
}
