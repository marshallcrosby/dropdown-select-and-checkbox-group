/// <binding ProjectOpened='build' />
'use strict';

const gulp = require('gulp');

// CSS-related
const sass = require('gulp-dart-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cleanCss = require('gulp-clean-css');

// JS-related
const minify = require('gulp-minify');
const include = require('gulp-include');

// Utility-related
const sourcemaps = require('gulp-sourcemaps');
const connect = require('gulp-connect');
const open = require('gulp-open');

const localhost = 'http://localhost:8080/';

const roots = {
    src: './src',
    dist: './dist',
};

// Creates JS sourcemaps, concatenates JS files into one file based on array above, and minifies JS
gulp.task('js', function () {
    return gulp.src([
            `${roots.src}/js/bundle.js`,
            `${roots.src}/js/simple-dropdown.js`,
            `${roots.src}/js/select-to-dropdown.js`,
            `${roots.src}/js/checkbox-group-dropdown.js`
        ])
        .pipe(include())
        .pipe(sourcemaps.init())
        .pipe(minify({
            ext: {
                min: '.min.js'
            },
                preserveComments: 'some'
            }
        ))
        .pipe(gulp.dest(roots.dist + '/js', { sourcemaps: '.' }))
        .pipe(connect.reload());
});


// Creates CSS sourcemaps, converts SCSS to CSS, adds prefixes, and lints CSS
gulp.task('sass', function () {
    const plugins = [
        autoprefixer({ grid: true })
    ];

    return gulp.src([`${roots.src}/scss/select-to-dropdown.scss`])
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(plugins))
        .pipe(cleanCss({compatibility: 'ie11'}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(`${roots.dist}/css`))
        .pipe(connect.reload());
});

// Move html to dist
gulp.task('copy-html', function () {
    return gulp.src([`${roots.src}/index.html`])
        .pipe(gulp.dest(`${roots.dist}`))
        .pipe(connect.reload());
});

// Move js to dist
gulp.task('copy-js', function () {
    return gulp.src([
            `${roots.src}/js/simple-dropdown.js`,
            `${roots.src}/js/select-to-dropdown.js`,
            `${roots.src}/js/checkbox-group-dropdown.js`
        ])
        .pipe(gulp.dest(`${roots.dist}/js`))
        .pipe(connect.reload());
});

// Runs a server to static HTML files and sets up watch tasks
gulp.task('server', function (done) {
    gulp.watch((`${roots.src}/**/*.html`), gulp.series('copy-html'));
    gulp.watch((`${roots.src}/scss/**/*.scss`), gulp.series('sass'));
    gulp.watch((`${roots.src}/js/**/*`), gulp.series('js', 'copy-js'));

    connect.server({
        root: roots.dist,
        livereload: true
    });

    setTimeout(function () {
        return gulp.src(__filename)
            .pipe(open({ uri: localhost }));
    }, 2000);

    done();
});

gulp.task('build', gulp.series('sass', 'js', 'copy-html', 'copy-js'));

gulp.task('default', gulp.series('build', 'server'));
