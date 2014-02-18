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
      docs: 'docs'
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
      myapp: {
        src: "<%= openjub.src %>/",
        dest: "<%= openjub.docs %>/"
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
            '<%= openjub.docs %>'
          ]
        }]
      }
    }
  });

  grunt.registerTask('docs', [
    'apidoc'
  ]);

  grunt.registerTask('build', [
    'jshint'
  ]);

  grunt.registerTask('default', ['build']);
};
