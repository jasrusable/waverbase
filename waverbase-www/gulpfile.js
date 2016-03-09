var gulp = require('gulp');

gulp.task('copy-index', function() {
  gulp.src('./index.html')
 .pipe(gulp.dest('./build'));
})

gulp.task('copy-images', function() {
  gulp.src('./images/favicon.ico')
 .pipe(gulp.dest('./build'));
})

// Default task
gulp.task('default', ['copy-index', 'copy-images']);
