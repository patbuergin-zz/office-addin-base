const babel       = require('gulp-babel'),
      browserSync = require('browser-sync').create(),
      ftp         = require('vinyl-ftp'),
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
    all    : '**/*',
    assets : 'assets/**/*',
    html   : '**/*.html',
    js     : '**/*.js',
    scss   : '**/*.scss',
    css    : '**/*.css'
};

const path = {
    src   : 'src/',
    debug : 'debug/',
    ship  : 'ship/',
    bower : 'bower_components/',
    ftp   : '/site/wwwroot' // Azure Web App
};

// Cleans the debug/ and ship/ folders
gulp.task('clean', () =>
    gulp.src([ path.debug, path.ship ])
        .pipe(rimraf())
);

// Applies operations to assets (e.g. images)
gulp.task('assets', () =>
    gulp.src(path.src + glob.assets)
        .pipe(gulp.dest(path.debug + 'assets'))
);

// Compiles the markup (html)
gulp.task('markup', () =>
    gulp.src(path.src + glob.html)
        .pipe(gulp.dest(path.debug))
);

// Compiles the scripts (js)
gulp.task('script', () =>
    gulp.src(path.src + glob.js)
        .pipe(plumber())
        .pipe(babel())
        .pipe(gulp.dest(path.debug))
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
        .pipe(gulp.dest(path.debug))
);

// Injects compiled scripts and styles, as well as all dependencies into index.html
gulp.task('index', ['markup', 'script', 'style'], () => {
    const sources = gulp.src(
        [ path.debug + glob.js, path.debug + glob.css ],
        { read: false }
    );
 
    return gulp.src(path.debug + 'index.html')
        .pipe(inject(sources, { relative: true }))
        .pipe(wiredep())
        .pipe(gulp.dest(path.debug));
});

// Debug build of the web application
gulp.task('build', ['assets', 'index']);

// Creates a debug build and serves it at https://localhost:8443/
gulp.task('serve', ['build'], () => {
    browserSync.init({
        https: true,
        notify: false,
        port: 8443,
        server: {
            baseDir: path.debug,
            routes: { '/bower_components': 'bower_components' }
        }
    });

    gulp.watch(path.src + glob.scss, ['bs-stream'])
    gulp.watch([path.src + glob.html, path.src + glob.js], ['bs-reload']);
});

// Streams style changes to Browsersync clients
gulp.task('bs-stream', ['style'], () =>
    gulp.src(path.debug + glob.css)
        .pipe(browserSync.stream())
);

// Triggers a refresh on Browsersync clients
gulp.task('bs-reload', ['build'], browserSync.reload);

// Moves assets to /ship
gulp.task('ship-assets', () =>
    gulp.src(path.debug + glob.assets)
        .pipe(gulp.dest(path.ship + 'assets'))
);

// Creates a production build in /ship
gulp.task('ship-build', ['build', 'ship-assets'], () =>
    gulp.src(path.debug + 'index.html')
        .pipe(usemin({
            html: [
                htmlmin({
                    collapseWhitespace: true,
                    removeTagWhitespace: true
                })
            ],
            css: [ minifyCss ],
            js: [ uglify ],
            vendorjs: [ () => uglify({ preserveComments: 'some' }) ]
        }))
        .pipe(gulp.dest(path.ship))
);

// Creates a production build and deploys it to an FTP server using the credentials
// stored in ftp.json (schema: { "host": "...", "user": "...", "pass": "..." })
gulp.task('ship', ['ship-build'], () => {
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

// When gulp is executed without args, run the serve task
gulp.task('default', ['serve']);