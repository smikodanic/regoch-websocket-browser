const gulp = require('gulp');
const rimraf = require('rimraf');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const minify = require('gulp-minify');
const sourcemaps = require('gulp-sourcemaps');



/***** GULP BASIC TASKS *****/
const rimrafTask = async () => {
  rimraf('./dist', () => {
    console.log('/dist deleted by rimraf!');
  });
};

const browserifyTask = async () => {
  browserify('./src/Client.js')
    .bundle()
    .pipe(source('client.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(minify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/'))
    .on('error', (err) => {
      console.log(err);
    });
};



/***** GULP WATCHERS *****/
gulp.task('watch', () => {
  gulp.watch([
    './src/*.js'
  ], gulp.series(rimrafTask, browserifyTask));
});



/***** GULP COMPOUND TASKS *****/
gulp.task('default', gulp.series(rimrafTask, browserifyTask, 'watch'));
