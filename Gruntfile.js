/*global module:false*/
module.exports = function(grunt) {

  var tilde = require('tilde-expansion'),
      s3Credentials;

  tilde('~/.cssconf-s3-credentials', function ( path ) {
    s3Credentials = grunt.file.readJSON( path );
  }),

  // Project configuration.
  grunt.initConfig({
    clean: ['dist/*.css'],
    watch: {
      files: ['sass/*.scss'],
      tasks: ['sass']
    },
    sass: {
      main: {
        files: {
          'dist/application.css': 'sass/application.scss'
        }
      }
    },
    csslint: {
      options: {
        csslintrc: '.csslintrc'
      },
      dist: {
        src: ['dist/*.css']
      }
    },
    recess: {
      dist: {
        options: {
          noOverqualifying: false
        },
        src: ['dist/application.css']
      }
    },
    autoprefixer: {
      build: {
        options: {
          browsers: ['last 2 versions', '> 1%']
        },
        files: [
          {
            src : ['**/*.css', '!**/*prefixed.css'],
            cwd : 'dist',
            dest : 'dist',
            ext : '.prefixed.css',
            expand : true
          }
        ]
      }
    },
    cssmin: {
      unprefixed: {
        src: 'dist/application.css',
        dest: 'dist/application.min.css'
      }
    },
    s3: {
      options: {
        key: s3Credentials.key,
        secret: s3Credentials.secret,
        bucket: 'cssconf.com.au',
        access: 'public-read'
      },
      dist: {
        upload: [
          {
            src: 'dist/*.css',
            dest: './'
          }
        ]
      }
    },
    connect: {
      server: {
        options: {
          port: 3000,
          base: './'
        }
      }
    }
  });

  // Default task.
  grunt.registerTask('default', ['clean', 'sass', 'autoprefixer', 'csslint', 'recess', 'cssmin']);

  // Use for development
  grunt.registerTask('dev', ['connect', 'watch']);

  // S3 credentials required to run this
  grunt.registerTask('release', ['default', 's3']);

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
};