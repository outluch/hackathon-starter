const gulp = require('gulp');
const p = require('gulp-load-plugins')();
const spawn = require('child_process').spawn;

let children = [];
let node = 0;

gulp.task('copy', () => {
  gulp.src('public_src/fonts/*').pipe(gulp.dest('public/fonts'));
});

gulp.task('imagemin', () => {
  gulp.src('public_src/img/**/*')
    .pipe(p.imagemin({
      optimizationLevel: 5,
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest('public/img'));
});

gulp.task('css_libs', () => {
  gulp.src([
      // "some/lib.css",
    ])
    .pipe(p.plumber())
    .pipe(p.concat('libs.css'))
    .pipe(p.cssmin())
    .pipe(gulp.dest('public/css'))
    .pipe(p.livereload({
      start: true
    }));
});

gulp.task('styles', () => {
  gulp.src('public_src/css/main.scss')
    .pipe(p.plumber())
    .pipe(p.sass().on('error', p.sass.logError))
    .pipe(gulp.dest('public/css'))
    .pipe(p.livereload({
      start: true
    }));
});

gulp.task('js_libs', () => {
  gulp.src([
      'public_src/js/lib/jquery-2.2.4.min.js',
      'public_src/js/lib/bootstrap.min.js',
    ])
    .pipe(p.concat('libs.js'))
    .pipe(p.uglify())
    .pipe(gulp.dest('public/js'))
    .pipe(p.livereload({
      start: true
    }));
});

gulp.task('js_app', () => {
  gulp.src('public_src/js/main.js')
    .pipe(p.plumber())
    .pipe(p.browserify())
    .pipe(p.babel({
      presets: ['es2015']
    }))
    // .pipe(p.concat('main.js'))
    // .pipe(p.uglify())
    .pipe(gulp.dest('public/js'))
    .pipe(p.livereload({
      start: true
    }));
});

gulp.task('reload', () => {
  gulp.src('').pipe(p.livereload());
});

// gulp.task('hash_assets', () => {
//   gulp.src('server/views/layouts/_base.ect')
//     .pipe(p.revHash({
//       assetsDir: 'public'
//     }))
//     .pipe(gulp.dest('server/views/layouts'));
// });

gulp.task('start_app', () => {
  node && node.kill('SIGHUP');
  node = spawn('node', ['app'], {
    stdio: 'inherit'
  });
  children.push(node);
  node.on('close', (code) => {
    if (code === 8) {
      gulp.log('Error detected, waiting for changes...');
    }
  });
});

gulp.task('watch', () => {
  gulp.watch('public_src/css/**/*', ['styles']);
  gulp.watch(['public_src/bower_components/**/*.js'], ['js_libs']);
  gulp.watch(['public_src/js/**/*.js'], ['js_app']);
  gulp.watch(['public_src/components/**/*.html'], ['templates']);
  gulp.watch(['controllers/**/*.js', 'config/**/*.js', 'views/**/*.*', 'app.js'], ['reload']);
  // gulp.watch(['controllers/**/*.js', 'config/**/*.js', 'views/**/*'], (e) => {
  //   gulp.run('start_app');
  //   gulp.src(e.path)
  //     // .pipe(p.wait(3000))
  //     .pipe(p.livereload({
  //       start: true
  //     }));
  // });
});

gulp.task('default', [
  'copy',
  'imagemin',
  'styles',
  'css_libs',
  'js_libs',
  'js_app',
  // 'hash_assets',
  'start_app',
  'watch'
]);

process.on('exit', () => {
  console.log('killing', children.length, 'child processes');
  children.forEach(child => child.kill());
});
