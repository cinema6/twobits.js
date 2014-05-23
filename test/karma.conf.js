module.exports = function(config) {
    'use strict';

    config.set({
        autoWatch: false,
        browsers: ['PhantomJS'],

        frameworks: ['jasmine', 'commonjs'],

        preprocessors: {
            '../twobits.js': ['commonjs'],
            'spec/**/*.js': ['commonjs'],
            '../node_modules/jquery-browserify/lib/*.js': ['commonjs']
        },

        singleRun: true
    });
};
