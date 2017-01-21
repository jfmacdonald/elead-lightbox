var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

var plugin = 'elead-lightbox';
var publik = './public/';

var vendorScripts = [
    // Validate.js
    // 'vendor/validatejs/validate.js'
];

var appScripts = [
    publik + 'js/validate.js',
    publik + 'js/app-public.js'
];

var sassPaths = [
    'vendor/bourbon/app/assets/stylesheets',
    'vendor/susy/sass'
];

gulp.task('pstyles', function () {
    return gulp.src(publik + 'sass/' + plugin + '-public.scss')
        .pipe($.sourcemaps.init())
        .pipe($.sass({
            includePaths: sassPaths
            , outputStyle: 'compressed'
        }).on('error', $.sass.logError))
        .pipe($.autoprefixer({
            browsers: ['last 2 versions', 'ie >= 9']
        }))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest(publik + 'css'));
});

gulp.task('pscripts', function () {
    return gulp.src(vendorScripts.concat(appScripts))
        .pipe($.babel({
            presets: ['es2015']
            // , compact: true
        }))
        .pipe($.sourcemaps.init())
        .pipe($.concat(plugin + '-public.js'))
        .pipe(gulp.dest(publik + 'js'))
        .pipe($.rename({suffix: '.min'}))
        .pipe($.uglify())
        .pipe($.sourcemaps.write('.')) 
        .pipe(gulp.dest(publik + 'js'))
});

gulp.task('watch', function () {
    gulp.watch([publik + 'sass/**/*.scss'], ['pstyles']);
    gulp.watch(appScripts, ['pscripts']);
});

gulp.task('default', ['pstyles', 'pscripts']);
