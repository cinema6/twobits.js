(function() {
    'use strict';

    var gulp = require('gulp');

    var karma = require('gulp-karma');

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
}());
