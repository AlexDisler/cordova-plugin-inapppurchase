import concat  from 'gulp-concat';
import gulp    from 'gulp';
import plumber from 'gulp-plumber';
import babel   from 'gulp-babel';
import addsrc  from 'gulp-add-src';

const src = './src/js/';
const dist = './www';
const indexAndroid = 'index-android.js';
const polyfillsAndroid = 'polyfills-android.js';
const indexIos = 'index-ios.js';
const utils = 'utils.js';

const build = () => {
  gulp
    .src([ src + utils, src + indexIos ])
    .pipe(plumber())
    .pipe(babel())
    .pipe(concat(indexIos))
    .pipe(gulp.dest(dist));
  gulp
    .src([ src + utils, src + indexAndroid ])
    .pipe(plumber())
    .pipe(babel())
    .pipe(addsrc.prepend(src + polyfillsAndroid))
    .pipe(concat(indexAndroid))
    .pipe(gulp.dest(dist));
};

gulp.task('build', build);

gulp.task('watch', () => {
  gulp.run(['build']);
  gulp.watch(src + '*.js', ['build']);
});

gulp.task('default', ['build']);
