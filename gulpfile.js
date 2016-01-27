const babel       = require('gulp-babel'),
      browserSync = require('browser-sync').create(),
      gulp        = require('gulp'),
      inject      = require('gulp-inject'),
      minifyCss   = require('gulp-minify-css'),
      plumber     = require('gulp-plumber'),
      rimraf      = require('gulp-rimraf'),
      sass        = require('gulp-sass'),
      uglify      = require('gulp-uglify'),
      wiredep     = require('wiredep').stream;

const glob = {
    assets: 'assets/**/*',
    html: '**/*.html',
    js: '**/*.js',
    css: '**/*.css'
};

const path = {
    src:  'src/',
    dist: 'dist/',
    ship: 'ship/'
};

// Cleans the dist/ and ship/ folders
gulp.task('clean', function () {
    return gulp.src([ path.dist, path.ship ])
        .pipe(rimraf());
});

// Applies operations to assets (e.g. images)
gulp.task('assets', () => {
    return gulp.src(path.src + glob.assets)
        .pipe(gulp.dest(path.dist))
});

// Compiles the markup (html)
gulp.task('markup', () => {
    return gulp.src(path.src + glob.html)
        .pipe(gulp.dest(path.dist))
});

// Compiles the scripts (js)
gulp.task('script', () => {
    return gulp.src(path.src + glob.js)
        .pipe(plumber())
        .pipe(babel())
        .pipe(uglify())
        .pipe(gulp.dest(path.dist))
});

// Compiles the styles (css)
gulp.task('style', () => {
    return gulp.src(path.src + '_scss/style.scss')
        .pipe(plumber())
        .pipe(sass({ includePaths: './src/_scss' }))
        .pipe(minifyCss())
        .pipe(gulp.dest(path.dist))
});

// Injects compiled scripts and styles, as well as all dependencies into index.html
gulp.task('index', ['markup', 'script', 'style'], function () {
    const sources = gulp.src(
        [ path.dist + glob.js, path.dist + glob.css ],
        { read: false }
    );
 
    return gulp.src(path.dist + 'index.html')
        .pipe(inject(sources, { relative: true }))
        .pipe(wiredep())
        .pipe(gulp.dest(path.dist));
});

// Serves the static content on https://localhost:8443
gulp.task('serve', ['build'], () => {
    browserSync.init({
        https: true,
        notify: false,
        port: 8443,
        server: {
            baseDir: "./"
        }
    });

    gulp.watch(path.src + glob.scss, ['bs-stream'])
    gulp.watch([path.src + glob.html, path.src + glob.js], ['bs-reload']);
});

// Stream style changes to Browsersync clients
gulp.task('bs-stream', ['style'], () => {
    gulp.src(path.dist + glob.css)
        .pipe(browserSync.stream())
});

// Trigger a refresh on Browsersync clients
gulp.task('bs-reload', ['build'], () => {
    browserSync.reload();
});

gulp.task('build', ['assets', 'index']);
gulp.task('default', ['serve']);
gulp.task('ship', []);