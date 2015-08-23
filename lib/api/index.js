'use strict';
var express = require('express');
var winston = require('winston');

var logging = require('../log');
var settings = require('../settings');
var db = require('../db');

var app = express();

// Express Configuration
var rootPath = require('./config/express').configure(app);

// API Routes
require('./routes').route(app, rootPath);

//what a lovely picture
winston.log('info', '\n\
                                                                            \n\
           0xxxx00                                                          \n\
             00xxxx0    00                                        00        \n\
                0x0 0000000000                                 0xxxx0       \n\
       0        00 000000000000  0000000000000000000000000  0xxx00          \n\
       0xx00   0x 00000000000000 0000000000000000000000000 xx0              \n\
        0xxxxxxxx  0000000000000 0000000000000000000000000                  \n\
          000xx000 000000000000                 0000000000                  \n\
                      000000   xxx00         000 00000000                   \n\
                      0    000 xxxxxxx00  0xxx0  00000000                   \n\
                      00000000 xxxxxxxxxx000     0000000                    \n\
                       0000000  0xxxxxxxxxxxx0  0000000                     \n\
                        0000000 0x000xxxxxxxxx 0000000                      \n\
                      00 0000000 0x   000xxxx 0000000                       \n\
                  00xxxxx  000000         00 0000000 0x000  0000            \n\
               0xxxxxxxxxx0 0000  0        0000000 0xxxxxxxxxxxxxx0         \n\
           0xxxxxxxxxxxxxx00    00000    0000000  0xxxxxxxxxx0 00xxx        \n\
        0x00xxxxxxxxxxx0         0000000000000       00xxxx0       00       \n\
        0xx00xxxxxx00              00000000            0xxx                 \n\
          xx00xx0                     00                xxxx00              \n\
           00                                            00xxxxx0           \n\
                                                                            \n\
 ________  ________  _______   ________         ___  ___  ___  ________     \n\
|\\   __  \\|\\   __  \\|\\  ___ \\ |\\   ___  \\      |\\  \\|\\  \\|\\  \\|\\   __  \\    \n\
\\ \\  \\|\\  \\ \\  \\|\\  \\ \\   __/|\\ \\  \\\\ \\  \\     \\ \\  \\ \\  \\\\\\  \\ \\  \\|\\ /_   \n\
 \\ \\  \\\\\\  \\ \\   ____\\ \\  \\_|/_\\ \\  \\\\ \\  \\  __ \\ \\  \\ \\  \\\\\\  \\ \\   __  \\  \n\
  \\ \\  \\\\\\  \\ \\  \\___|\\ \\  \\_|\\ \\ \\  \\\\ \\  \\|\\  \\\\_\\  \\ \\  \\\\\\  \\ \\  \\|\\  \\ \n\
   \\ \\_______\\ \\__\\    \\ \\_______\\ \\__\\\\ \\__\\ \\________\\ \\_______\\ \\_______\\\n\
    \\|_______|\\|__|     \\|_______|\\|__| \\|__|\\|________|\\|_______|\\|_______|\n\
                                                                            ');

// Start server
var port = process.env.PORT || settings.port;
app.listen(port, function () {
  winston.log('info', 'Express server listening on port %d in %s mode', port, app.get('env'));
});

// Expose app
exports = module.exports = app;
