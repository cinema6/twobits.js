(function() {
    'use strict';

    var gulp = require('gulp');

    var karma = require('gulp-karma'),
        browserify = require('gulp-browserify'),
        uglify = require('gulp-uglify'),
        rename = require('gulp-rename'),
        bump = require('gulp-bump');

    var args = require('minimist')(process.argv.slice(2));

    var srcFiles = [
            'twobits.js'
        ],
        testFiles = [
            'test/spec/**/*.js'
        ],
        libFiles = [
            'node_modules/jquery-browserify/lib/jquery.js'
        ],
        allJs = []
            .concat(srcFiles)
            .concat(testFiles)
            .concat(libFiles);

    gulp.task('test:unit', function() {
        return gulp.src(allJs)
            .pipe(karma({
                configFile: 'test/karma.conf.js',
                action: 'run'
            }))
            .on('error', function(err) {
                throw err;
            });
    });

    gulp.task('test:unit:debug', function() {
        return gulp.src(allJs)
            .pipe(karma({
                configFile: 'test/karma.conf.js',
                action: 'watch'
            }));
    });

    gulp.task('build', ['test:unit'], function() {
        return gulp.src('./twobits.js')
            .pipe(browserify({
                standalone: 'tb'
            }))
            .pipe(gulp.dest('./dist'))
            .pipe(uglify())
            .pipe(rename('twobits.min.js'))
            .pipe(gulp.dest('./dist'));
    });

    gulp.task('bump', ['test:unit'], function() {
        return gulp.src('./package.json')
            .pipe(bump({
                type: args.type
            }))
            .pipe(gulp.dest('./'));
    });
}());
