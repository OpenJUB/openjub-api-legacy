# OpenJUB API 0.2.1

Server providing the actual OpenJUB API

## Dependencies
- Node.JS + npm
- MongoDB

## Install

1. Install MongoDB and Node.JS 

2. Run:

```
  $ git clone git@github.com/openjub/openjub-api.git
  $ cd openjub-api
  $ npm install -g grunt grunt-cli express bower
  $ npm install
  $ bower install
  $ cp _settings.json settings.json # change config if necessary
  $ ./lib/sync -s # updates data from LDAP and re-parses old entries
```

## Run Server

Run the following two commands to start the server in two different folders

```
  $ mongod # start in separate tab or as daemon
  $ node index.js # server runs on default port 6969
```

## Generate Documentation

Run and start server afterwards:

```
  $ grunt docs
```

Navigate with your browser to: `http://localhost:6969/docs` or `http://localhost:6969/api`

## Changelog
### Version 0.2.1
* update the sign-in dialog
* redo session management and authentication
* added some indexes for performance
### Version 0.2.0
* changes to the sync script
  * moved from 'tasks/sync' to 'lib/sync'
  * now gives a lot more warnings when stuff in the database is not the way its supposed to be
  * now optionally reads password from config file
  * better syncronisation behaviour
    * can now re-parse old entries and mark them as inactive. 
    * can now sync with ldap or with file
    * can dump the entire database to a file. 
* slight change to how requests with multiple results are handled
  * now returns a "count" parameter that counts the number of results
  * the ```prev``` and ```next``` parameters return ```false``` whenever the resulting url does not make sense
* rewrote query syntax Parser
  * more flexible
  * supports auto-completion now
* cleanup of phone room mapping
  * now internally stored on a per-building basis
  * uses data from LDAP if available
  * automatically renewed when needed
* rename of main script
  * now called ```index.js``` (instead of ```server.js```)
* more code cleanup:
  * performance improvements by querying mongodb with several queries at once
  * code seperation between REST parsing and handling of queries
### Version 0.1
* complete code cleanup
* documentation

### Version 0.0
* actually not really versioned
* initial release

## Contributors
- Tom Wiesing <tom.wiesing@gmail.com>
- Dominik Kundel <dominik.kundel@gmail.com>
- Dmitrii Cuclescin <dmitrii.cucleschin@gmail.com>
