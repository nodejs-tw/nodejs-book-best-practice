'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('./package.json'),
    publicDir: 'public',
    serverDir: 'server',
    toolsDir: 'tools',
    srcDir: 'app',

    watch: {
      options: {
        livereload: true
      },

      stylus: {
        files: ['<%= srcDir %>/**/*.styl', '!bower_components/**/*'],
        tasks: ['stylus:devPublic']
      },

      jade: {
        files: ['<%= srcDir %>/**/*.jade', '!bower_components/**/*'],
        tasks: ['jade:devPublic']
      },

      js: {
        files: ['<%= srcDir %>/**/*.js', '!bower_components/**/*'],
        tasks: ['copy:js']
      },

      ls: {
        files: ['<%= srcDir %>/**/*.ls', '!bower_components/**/*'],
        tasks: ['livescript']
      },

      image: {
        files: ['<%= srcDir %>/<%= publicDir %>/images/**/*'],
        tasks: ['copy:images']
      },

      font: {
        files: ['<%= srcDir %>/<%= publicDir %>/fonts/**/*'],
        tasks: ['copy:fonts']
      },

      bower: {
        files: ['<%= srcDir %>/bower_components/**/*', '!bower_components/**/*'],
        tasks: ['copy:bower']
      }
    },

    stylus: {
      devPublic: {
        options: {
          compress: false
        },
        files: [
          {
            expand: true,
            cwd: '<%= srcDir %>/<%= publicDir %>',
            src: ['**/*.styl'],
            dest: '<%= publicDir %>',
            ext: '.css',
            filter: 'isFile'
          }
        ]
      }
    },

    jade: {
      devPublic: {
        options: {
          pretty: true
        },
        files: [
          {
            expand: true,
            cwd: '<%= srcDir %>/<%= publicDir %>',
            src: ['**/*.jade'],
            dest: '<%= publicDir %>',
            ext: '.html',
            filter: 'isFile'
          }
        ]
      }
    },

    livescript: {
      dev: {
        files: [
          {
            expand: true,
            cwd: '<%= srcDir %>/<%= publicDir %>',
            src: ['**/*.ls'],
            dest: '<%= publicDir %>',
            ext: '.js',
            filter: 'isFile'
          },
          {
            expand: true,
            cwd: '<%= srcDir %>/<%= serverDir %>',
            src: ['**/*.ls'],
            dest: '<%= serverDir %>',
            ext: '.js',
            filter: 'isFile'
          },
          {
            expand: true,
            cwd: '<%= srcDir %>/<%= toolsDir %>',
            src: ['**/*.ls'],
            dest: '<%= toolsDir %>',
            ext: '.js',
            filter: 'isFile'
          }
        ]
      }
    },

    copy: {
      bower: {
        files: [
          {
            expand: true,
            cwd: '<%= srcDir %>/bower_components',
            src: ['**/*'],
            dest: '<%= publicDir %>/components'
          }
        ]
      },

      js: {
        files: [
          {
            expand: true,
            cwd: '<%= srcDir %>/<%= publicDir %>',
            src: ['**/*.js'],
            dest: '<%= publicDir %>',
            filter: 'isFile'
          }
        ]
      },

      images: {
        files: [
          {
            expand: true,
            cwd: '<%= srcDir %>/<%= publicDir %>/images',
            src: ['**/*'],
            dest: '<%= publicDir %>/images',
            filter: 'isFile'
          }
        ]
      },

      fonts: {
        files: [
          {
            expand: true,
            cwd: '<%= srcDir %>/<%= publicDir %>/fonts',
            src: ['**/*'],
            dest: '<%= publicDir %>/fonts',
            filter: 'isFile'
          }
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-livescript');

  grunt.registerTask('default', ['copy', 'stylus:devPublic', 'jade:devPublic', 'livescript']);
  grunt.registerTask('dev', ['copy', 'stylus:devPublic', 'jade:devPublic', 'livescript', 'watch']);
};
