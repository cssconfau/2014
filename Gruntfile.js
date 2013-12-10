/*global module:false*/
module.exports = function(grunt) {

  var tilde = require('tilde-expansion'),
      s3Credentials;

  tilde('~/.cssconf-s3-credentials', function ( path ) {
    s3Credentials = grunt.file.readJSON( path );
  }),

  // Project configuration.
  grunt.initConfig({
    clean: ['dist/css/*'],
    watch: {
      files: ['sass/*.scss'],
      tasks: ['css']
    },
    sass: {
      main: {
        files: {
          'dist/css/2014.css': 'sass/2014.scss'
        }
      }
    },
    csslint: {
      options: {
        csslintrc: '.csslintrc'
      },
      dist: {
        src: ['dist/css/*.css']
      }
    },
    recess: {
      dist: {
        options: {
          noOverqualifying: false
        },
        src: ['dist/css/2014.css']
      }
    },
    autoprefixer: {
      build: {
        options: {
          browsers: ['last 2 versions', '> 1%']
        },
        files: [
          {
            src : ['*.css', '!*prefixed.css'],
            cwd : 'dist/css',
            dest : 'dist/css',
            expand : true
          }
        ]
      }
    },
    cssmin: {
      prefixed: {
        src: 'dist/css/2014.css',
        dest: 'dist/css/2014.min.css'
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
            src: 'dist/**/*',
            dest: './',
            rel: 'dist'
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

  // Compile CSS
  grunt.registerTask('css', ['clean', 'sass', 'autoprefixer', 'csslint', 'recess']);

  // Default task.
  grunt.registerTask('default', ['css']);

  // Use for development
  grunt.registerTask('dev', ['connect', 'watch']);

  // S3 credentials required to run this
  grunt.registerTask('release', ['default', 's3']);

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
};