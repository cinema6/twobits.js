(function() {
    'use strict';

    describe('tb', function() {
        var tb;

        var $;

        var $testBox;

        beforeEach(function() {
            $ = require('../../node_modules/jquery-browserify/lib/jquery.js');
            tb = require('../../twobits');

            $testBox = $([
                '<div id="test">',
                    '<style id="css">',
                        '.texty {',
                            'background: url("{{img}}");',
                        '}',
                    '</style>',
                    '<div>',
                        '<span id="test-attr-style" style="width: {{dims.width}}px; height: {{dims.height}}px;">Hello<span>',
                        '{{prop.does.not.exist}}',
                    '</div>',
                    '<section>',
                        '<p id="test-attr-class" class="{{classes.p.name}}">Cool</p>',
                        '<p id="test-text-p">Hello. My Name is {{name}}!</p>',
                        '<p id="test-text-multiple">{{name}} is {{name}}!</p>',
                        '<img id="test-attr-prefix" tb-src="{{img}}"></img>',
                    '</section>',
                '</div>'
            ].join('\n'));
            $('body').append($testBox);
        });

        afterEach(function() {
            $testBox.remove();
        });

        it('should exist', function() {
            expect(tb).toEqual(jasmine.any(Object));
        });

        describe('tb.parse(node)', function() {
            var result;

            beforeEach(function() {
                result = tb.parse($testBox[0]);
            });

            it('should return a function', function() {
                expect(result).toEqual(jasmine.any(Function));
            });

            describe('the compile function', function() {
                var compile,
                    model;

                beforeEach(function() {
                    model = {
                        dims: {
                            width: 300,
                            height: 125
                        },
                        classes: {
                            p: {
                                name: 'texty'
                            }
                        },
                        name: 'Joshua Minzner',
                        img: 'foo.jpg'
                    };

                    compile = result;

                    compile(model);
                });

                it('should compile attributes', function() {
                    var $styleTest = $testBox.find('#test-attr-style'),
                        $classTest = $testBox.find('#test-attr-class');

                    expect($styleTest.attr('style')).toBe('width: 300px; height: 125px;');
                    expect($classTest.attr('class')).toBe('texty');
                });

                it('should support multiple compilations', function() {
                    model.dims.height = 600;
                    compile(model);

                    expect($testBox.find('#test-attr-style').attr('style')).toBe('width: 300px; height: 600px;');
                });

                it('should compile text', function() {
                    var $pText = $testBox.find('#test-text-p'),
                        $css = $testBox.find('#css');

                    expect($pText.text()).toBe('Hello. My Name is Joshua Minzner!');
                    expect($css.text()).toBe([
                        '',
                        '.texty {',
                            'background: url("foo.jpg");',
                        '}',
                        ''
                    ].join('\n'));

                    model.name = 'Jessica Minzner';
                    compile(model);
                    expect($pText.text()).toBe('Hello. My Name is Jessica Minzner!');
                });

                it('should support multiple bindings to the same property', function() {
                    var $multiple = $testBox.find('#test-text-multiple');

                    expect($multiple.text()).toBe('Joshua Minzner is Joshua Minzner!');
                });

                it('should bind attributes prefixed with "tb" to their unprefixed counterpart', function() {
                    var $prefixed = $testBox.find('#test-attr-prefix');

                    expect($prefixed.attr('src')).toBe('foo.jpg');
                });
            });
        });
    });
}());
