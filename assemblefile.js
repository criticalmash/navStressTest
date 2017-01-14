/**
 * Assemble file for maytest
 *
 * test latest version of Assemble ( 0.11.0)
 *
 */

'use strict';

// var path = require('path');
var assemble = require('assemble');
var Navigation = require('assemble-navigation');
var extname = require('gulp-extname');
// var sass = require('gulp-sass');
// var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var watch = require('base-watch');
// var Handlebars = require('handlebars');
var midden = require('assemble-midden');
var minimist = require('minimist');
// var browserify = require('browserify');
// var babelify = require('babelify');
// var source = require('vinyl-source-stream');
// var buffer = require('gulp-buffer');
// var uglify = require('gulp-uglify');
// var gutil = require('gulp-util');
// var yaml = require('js-yaml');
// var Remarkable = require('remarkable');
var permalinks = require('assemble-permalinks');
var markdownMid = require('assemble-middleware-md');

/**
 * Setup some global variables
 */
var options = minimist(process.argv.slice(2));
var environment = options.environment || 'development';


/**
 * Create an instance of assemble
 */

var app = assemble();


/**
 * Load Plugins
 */

app.use(watch());


/**
 * Load global site data
 */
app.data({
  site: {
    title: 'Assemble Navigation Stress Test',
    timestamp: new Date()
  }
});


/**
 * load helpers
 */
app.helpers('helpers', require('handlebars-helpers')());

app.helper('midden', midden(environment));

/**
 * middleware
 */
var navigation = new Navigation();

app.pages.onLoad(/\.hbs$|\.md$/, navigation.onLoad());
app.pages.preRender(/\.hbs$|\.md$/, navigation.preRender());

app.pages.onLoad(/\.md$/, markdownMid({html: true}));


/**
 * Content and template tasks
 */
app.task('load', function (cb) {
  app.layouts('src/templates/layouts/**/*.hbs');
  app.partials('src/templates/partials/**/*.hbs');
  app.option('layout', 'default');
  cb();
});


app.task('content', ['load'], function () {
  app.pages('src/content/**/*.{md,hbs}');
  return app.toStream('pages')
    .pipe(app.renderFile())
    .on('err', console.error)
    .pipe(extname())
    .pipe(app.dest('build'))
    .pipe(browserSync.stream());
});


// /**
//  * Pre-process Styles
//  */
// var styleIncludes = [
//   'node_modules/foundation-sites/scss/',
//   'node_modules/midden/dist/styles/'
// ];
// app.task('css', function () {
//   return app.src('src/scss/app.scss')
//     .pipe(sass({includePaths: styleIncludes}).on('error', sass.logError))
//     .pipe(autoprefixer())
//     .pipe(app.dest('build/css'))
//     .pipe(browserSync.stream());
// });


/**
 * Development tasks
 */
app.task('serve', function () {
  browserSync.init({
    port: 8080,
    startPath: 'index.html',
    server: {
      baseDir: 'build'
    }
  });
});


app.task('watch', function () {
  app.watch('src/content/**/*.{md,hbs}', ['content']);
  app.watch('src/templates/**/*.{md,hbs}', ['content']);
});

/**
 * Main tasks
 */

// build site, serve then watch for edits
app.task('default', ['content'], app.parallel(['serve', 'watch']));


// just build the site
app.task('build', ['content']);

/**
 * Expose the assemble instance
 */

module.exports = app;
