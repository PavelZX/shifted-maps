var gulp = require('gulp'),
  gulpUtil = require('gulp-util'),
  path = require('path'),
  browserify = require('browserify'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),
  babelify = require('babelify'),
  compass = require('gulp-compass'),
  uglify = require('gulp-uglify'),
  gls = require('gulp-live-server'),
  sourcemaps = require('gulp-sourcemaps');

var server = gls.new('app.js');

gulp.task('serve', function() {
  server.start();
});

gulp.task('browserify', function() {
  var bundler = browserify({
    debug: true,
    entries: ['app/client/index.js'],
    transform: [
      babelify.configure({ sourceMaps: false })
    ]
  });

  return bundler.bundle()
    .pipe(source('index.js'))
    .on('error', (error) => {
      gulpUtil.log(error.message);
      this.emit('end');
    })
    .pipe(gulp.dest('public/scripts'));
});

gulp.task('compass', function() {
  return gulp.src(['app/client/styles/**/*.scss', '!app/client/styles/**/_*.scss'])
    .pipe(compass({
      sourcemap: true,
      style: 'compressed',
      project: path.join(__dirname, 'app/client/styles/'),
      css: path.join(__dirname, 'public/styles'),
      sass: path.join(__dirname, 'app/client/styles/')
    }))
    .on('error', gulpUtil.log)
    .pipe(gulp.dest('public/styles'));
});

gulp.task('compress', ['compress:js', 'compress:css']);

gulp.task('compress:js', ['browserify'], function() {
  return gulp.src('public/scripts/index.js')
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(uglify(/*{
      compress: {
        global_defs: {
          DEBUG: true
        },
        dead_code: true
      }
    }*/))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('public/scripts'));
});

gulp.task('compress:css', ['compass'], function() {
  return gulp.src('public/styles/**/*.scss')
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('public/styles'));
});

gulp.task('watch', function() {
  gulp.watch(['app/server/**/*.js', 'app/server/**/*.nunj'], ['serve']);
  gulp.watch(['app/client/styles/**/*.scss'], ['compass']);
  gulp.watch(['app/client/**/*.js'], ['browserify']);
  gulp.watch(['public/scripts/**/*.js', 'public/styles/**/*.css'], function (event) {
    server.notify(event);
    gulpUtil.log(gulpUtil.colors.gray('Notified server.'));
  });
});

gulp.task('default', ['serve', 'compass', 'browserify', 'watch']);