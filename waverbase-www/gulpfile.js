var gulp = require('gulp');
var babel = require('gulp-babel');
var watch  = require('gulp-watch');
var livereload = require('gulp-livereload');

gulp.task('copy-node_modules', function() {
  gulp.src('./node_modules/**/*')
  .pipe(gulp.dest('./dist/node_modules'));
});

gulp.task('copy-index', function() {
  gulp.src('./index.html')
 .pipe(gulp.dest('./dist'));
});

gulp.task('copy-images', function() {
  gulp.src('./images/favicon.ico')
 .pipe(gulp.dest('./dist'));
});

gulp.task('compile-jsx', function() {
  gulp.src('src/app.js')
  .pipe(babel({
    presets: ['es2015', 'react'],
  }))
  .pipe(gulp.dest('dist'));
});

gulp.task('copy-semantic-ui', function() {
   gulp.src([
     'semantic/dist/semantic.min.js',
     'semantic/dist/semantic.min.css',
   ])
   .pipe(gulp.dest('./dist'));
});

// Default task
gulp.task('default', [
  'copy-index',
  'copy-images',
  'copy-node_modules',
  'compile-jsx',
  'copy-semantic-ui',
]);

gulp.task('watch', function(cb) {
  watch('src/app.js', function() {
    gulp.start('default');
  });

  gulp.watch('./dist/*').on('change', livereload.changed);
})

gulp.task('quick', ['copy-index', 'compile-jsx']);

gulp.task('watch-quick', function(cb) {
  livereload.listen();
  watch('src/app.js', function() {
    gulp.start('quick');
  });

  gulp.watch('./dist/*').on('change', livereload.changed);
})
