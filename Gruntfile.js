'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    openjub: {
      dist: 'dist',
      src: 'lib',
      apidocs: 'api',
      srcdocs: 'docs'
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish'),
        ignores: [
          '<%= openjub.src %>/vendor/{,*/}*.js'
        ]
      },
      all: [
        '<%= openjub.src %>/{,*/}*.js'
      ]
    },

    apidoc: {
      openjub: {
        src: "<%= openjub.src %>/",
        dest: "<%= openjub.apidocs %>/"
      }
    },

    "jsdoc-ng" : {
      openjub: {
        src: ['<%= openjub.src %>', 'README.md' ],
        dest: '<%= openjub.srcdocs %>',
        template: 'node_modules/jaguarjs-jsdoc',
        options:  {
          source: {
              includePattern: ".+\\.js(doc)?$",
              excludePattern: "(^|\\/|\\\\)_"
          },
          opts: {
              recurse: true,
              private: true
          }
        }
      }
    },

    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '<%= openjub.dist %>'
          ]
        }]
      },
      docs: {
        files: [{
          dot: true,
          src: [
            '<%= openjub.apidocs %>',
            '<%= openjub.srcdocs %>'
          ]
        }]
      }
    }
  });

  grunt.loadNpmTasks('grunt-jsdoc-ng');

  grunt.registerTask('docs', [
    'apidoc',
    'jsdoc-ng'
  ]);

  grunt.registerTask('build', [
    'docs', 
    'jshint'
  ]);

  grunt.registerTask('default', ['build']);
};
