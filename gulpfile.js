const babel       = require('gulp-babel'),
      browserSync = require('browser-sync').create(),
      ftp         = require( 'vinyl-ftp' ),
      gulp        = require('gulp'),
      htmlmin     = require('gulp-htmlmin'),
      inject      = require('gulp-inject'),
      minifyCss   = require('gulp-minify-css'),
      plumber     = require('gulp-plumber'),
      rimraf      = require('gulp-rimraf'),
      sass        = require('gulp-sass'),
      uglify      = require('gulp-uglify'),
      usemin      = require('gulp-usemin'),
      util        = require('gulp-util'),
      wiredep     = require('wiredep').stream;

const glob = {
    all: '**/*',
    assets: 'assets/**/*',
    html: '**/*.html',
    js: '**/*.js',
    scss: '**/*.scss',
    css: '**/*.css'
};

const path = {
    src:  'src/',
    dist: 'dist/',
    ship: 'ship/',
    bower: 'bower_components/',
    ftp: '/site/wwwroot' // Azure Web App
};

// Cleans the dist/ and ship/ folders
gulp.task('clean', () =>
    gulp.src([ path.dist, path.ship ])
        .pipe(rimraf())
);

// Applies operations to assets (e.g. images)
gulp.task('assets', () =>
    gulp.src(path.src + glob.assets)
        .pipe(gulp.dest(path.dist + 'assets'))
);

// Compiles the markup (html)
gulp.task('markup', () =>
    gulp.src(path.src + glob.html)
        .pipe(gulp.dest(path.dist))
);

// Compiles the scripts (js)
gulp.task('script', () =>
    gulp.src(path.src + glob.js)
        .pipe(plumber())
        .pipe(babel())
        .pipe(gulp.dest(path.dist))
);

// Compiles the styles (css)
gulp.task('style', () =>
    gulp.src(path.src + '_scss/style.scss')
        .pipe(plumber())
        .pipe(sass({
            includePaths: [
                path.bower + 'office-ui-fabric/dist/sass',
                path.src + '_scss'
            ]
         }))
        .pipe(gulp.dest(path.dist))
);

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
gulp.task('bs-stream', ['style'], () =>
    gulp.src(path.dist + glob.css)
        .pipe(browserSync.stream())
);

// Trigger a refresh on Browsersync clients
gulp.task('bs-reload', ['build'], browserSync.reload);

// Creates a production build in /ship
gulp.task('build-ship', ['build'], () =>
    gulp.src(path.dist + 'index.html')
        .pipe(usemin({
            html: [
                htmlmin({
                    collapseWhitespace: true,
                    removeTagWhitespace: true
                })
            ],
            css: [ minifyCss ],
            js: [ uglify ],
            vendorjs: [ () => { return uglify({ preserveComments: 'some' }); } ]
        }))
        .pipe(gulp.dest(path.ship))
);

// Creates a production build and deploys it to an FTP server using the credentials
// stored in ftp.json (schema: { "host": "...", "user": "...", "pass": "..." })
gulp.task('ship', ['build-ship'], () => {
    const config = require('./ftp.json');
    const conn = ftp.create({
        host:     config.host,
        user:     config.user,
        password: config.pass,
        log:      util.log,
        parallel: 6,
        secure:   true
    });

    gulp.src(path.ship + glob.all, { buffer: false })
        .pipe(conn.newer(path.ftp)) // only upload newer files
        .pipe(conn.dest(path.ftp));
});

gulp.task('build', ['assets', 'index']);
gulp.task('default', ['serve']);