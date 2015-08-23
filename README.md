# OpenJUB API 0.2.0

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
  $ ./tasks/phoneRoomMapping # imports a mapping of phone -> room
  $ ./tasks/sync # gets data from LDAP (need on campus connection)
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
### Version 0.2.0
* changes to the sync script
  * has been taught the ```--verbose``` option to say what it does
  * better syncronisation behaviour
  * can now optionally read password from the configuration file
* slight change to how requests with multiple results are handled
  * now return a "count" parameter that counts the number of results
  * the ```prev``` and ```next``` parameters return ```false``` whenever the resulting url does not make sense
* rename of main script
  * now called ```index.js``` (instead of ```server.js```)
* cleanup of phone room mapping
  * now internally stored on a per-building basis
* more code cleanup:
  * performance improvements by querying mongodb with several queries at once
  * code seperation between REST parsing and handling of queries
  * moving code files around

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
