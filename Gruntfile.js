/*global module:false*/
module.exports = function(grunt) {

  var tilde = require('tilde-expansion'),
      s3Credentials = {
        key: '',
        secret: ''
      };

  tilde('~/.cssconf-s3-credentials', function (path) {
    if (grunt.file.exists(path))
      s3Credentials = grunt.file.readJSON(path);
  }),

  // Project configuration.
  grunt.initConfig({
    clean: {
      html: ['dist/**/*.html'],
      css: ['dist/css/*']
    },
    watch: {
      html: {
        files: ['templates/**/*'],
        tasks: ['html']
      },
      css: {
        files: ['sass/**/*.scss'],
        tasks: ['css']
      }
    },
    assemble: {
      options: {
        plugins: ['assemble-contrib-permalinks'],
        permalinks: { preset: 'pretty' },
        assets: 'dist',
        data: 'templates/data/*.json',
        partials: 'templates/partials/**/*.hbs',
        helpers: ['helper-moment', 'templates/helpers/*.js'],
        layoutdir: 'templates/layouts/',
        layout: 'default-layout.hbs'
      },
      site: {
        files: [
          {
            expand: true,
            cwd: 'templates/pages',
            src: ['**/*.hbs'],
            dest: 'dist/',
          }
        ]
      }
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
            src : ['*.css'],
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
        key:    s3Credentials.key,
        secret: s3Credentials.secret,
        bucket: 'cssconf.com.au',
        access: 'public-read',
        gzip:   true,
        gzipExclude: ['.jpg', '.png', '.eot'],
        maxOperations: 5
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
    invalidate_cloudfront: {
      options: {
        key: s3Credentials.key,
        secret: s3Credentials.secret,
        distribution: 'E2V9RA0RKMLGPM'
      },
      dist: {
        files: [{
          expand: true,
          cwd: './dist/',
          src: ['**/*'],
          filter: 'isFile',
          dest: ''
        }]
      }
    },
    connect: {
      server: {
        options: {
          hostname: '*',
          port: 3333,
          base: './dist'
        }
      }
    }
  });

  // Compile HTML pages
  grunt.registerTask('html', ['clean:html', 'assemble']);

  // Compile CSS
  grunt.registerTask('css', ['clean:css', 'sass', 'autoprefixer']);

  // Default task.
  grunt.registerTask('default', ['html', 'css']);

  // Use for development
  grunt.registerTask('dev', ['default', 'connect', 'watch']);

  // S3 credentials required to run this
  grunt.registerTask('release', ['default', 's3', 'invalidate_cloudfront']);

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  grunt.loadNpmTasks('assemble');
};