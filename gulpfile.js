const
    // modules
    gulp = require('gulp'),
    noop = require('gulp-noop'),
    newer = require('gulp-newer'),
    imagemin = require('gulp-imagemin'),
    htmlclean = require('gulp-htmlclean'),
    concat = require('gulp-concat'),
    deporder = require('gulp-deporder'),
    terser = require('gulp-terser'),
    sass = require('gulp-sass'),
    postcss = require('gulp-postcss'),
    assets = require('postcss-assets'),
    autoprefixer = require('autoprefixer'),
    mqpacker = require('css-mqpacker'),
    cssnano = require('cssnano'),
    browserSync = require('browser-sync').create(),

    // development mode?
    devBuild = (process.env.NODE_ENV !== 'production'),
    stripdebug = devBuild ? null : require('gulp-strip-debug'),
    sourcemaps = devBuild ? require('gulp-sourcemaps') : null,

    // folders
    src = 'src/',
    build = 'dist/';

function images() {

    const out = build + 'images/';

    return gulp.src(src + 'images/**/*')
        .pipe(newer(out))
        .pipe(imagemin({
            optimizationLevel: 5
        }))
        .pipe(gulp.dest(out))
        .pipe(browserSync.stream());

};

function html() {
    const out = build;

    return gulp.src(src + 'html/**/*')
        .pipe(newer(out))
        .pipe(devBuild ? noop() : htmlclean())
        .pipe(gulp.dest(out))
        .pipe(browserSync.stream());
}

function js() {

    return gulp.src([src + 'js/**/*', 'node_modules/jquery/dist/jquery.min.js', 'node_modules/popper.js/dist/umd/popper.min.js', 'node_modules/bootstrap/dist/js/bootstrap.min.js'])
        .pipe(sourcemaps ? sourcemaps.init() : noop())
        .pipe(deporder())
        .pipe(concat('main.js'))
        .pipe(stripdebug ? stripdebug() : noop())
        .pipe(terser())
        .pipe(sourcemaps ? sourcemaps.write() : noop())
        .pipe(gulp.dest(build + 'js/'))
        .pipe(browserSync.stream());

}

function font() {
    return gulp.src(['node_modules/font-awesome/fonts/*', src + 'fonts/**/*'])
        .pipe(gulp.dest(build + 'fonts/'));
}

function css() {

    return gulp.src(['node_modules/font-awesome/css/font-awesome.min.css','node_modules/bootstrap/scss/bootstrap.scss', src + 'scss/main.scss'])
        .pipe(sourcemaps ? sourcemaps.init() : noop())
        .pipe(sass({
            outputStyle: 'nested',
            imagePath: '/images/',
            precision: 3,
            errLogToConsole: true
        }).on('error', sass.logError))
        .pipe(postcss([
            assets({
                loadPaths: ['images/']
            }),
            autoprefixer({
                overrideBrowserslist: ['last 2 versions', '> 2%']
            }),
            mqpacker,
            cssnano
        ]))
        .pipe(concat('main.css'))
        .pipe(sourcemaps ? sourcemaps.write() : noop())
        .pipe(gulp.dest(build + 'css/'))
        .pipe(browserSync.stream());

}

function openBrowser(done) {
    browserSync.init({
        server: {
            baseDir: './' + build
        }
    });

    done();
}

function watch(done) {

    // image changes
    gulp.watch(src + 'images/**/*', images);

    // html changes
    gulp.watch(src + 'html/**/*', html);

    // css changes
    gulp.watch(src + 'scss/**/*', css);

    // js changes
    gulp.watch(src + 'js/**/*', js);

    done();

}




exports.css = gulp.series(images, font, css);
exports.html = gulp.series(html);
exports.js = gulp.series(js);
exports.browser = gulp.series(openBrowser);

exports.build = gulp.parallel(exports.html, exports.css, exports.js, exports.browser);
exports.watch = watch;
exports.default = gulp.series(exports.build, exports.watch);