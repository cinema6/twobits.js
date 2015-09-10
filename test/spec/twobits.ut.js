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
                    '<div></div>',
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

        describe('tb.directive(matcher, parseFn)', function() {
            var result;
            var parseFn;
            var compileFn;

            beforeEach(function() {
                compileFn = jasmine.createSpy('compileFn()');
                parseFn = jasmine.createSpy('parseFn()').and.callFake(function(element) {
                    element.insertAdjacentHTML('beforebegin', '<!-- Foo -->');
                    return compileFn;
                });

                result = tb.directive('div', parseFn);
            });

            afterEach(function() {
                tb.clear();
            });

            it('should be chainable', function() {
                expect(result).toBe(tb);
            });

            describe('when an element is parsed', function() {
                var compile;
                var data;

                beforeEach(function() {
                    data = { hello: 'world' };
                    compile = tb.parse($testBox[0], { context: data });
                });

                it('should call the directive parseFn for each matched element', function() {
                    $.each($testBox.find('div'), function(index, element) {
                        expect(parseFn).toHaveBeenCalledWith(element, data);
                    });
                    expect(parseFn).toHaveBeenCalledWith($testBox[0], data);
                    expect(parseFn.calls.count()).toBe(3);
                });

                describe('when the element is compiled', function() {
                    var data;

                    beforeEach(function() {
                        data = {
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

                        compile(data);
                    });

                    it('should call the compileFn() for each element', function() {
                        expect(compileFn.calls.count()).toBe(3);
                        compileFn.calls.all().forEach(function(call) {
                            expect(call.args).toEqual([jasmine.any(Function)]);
                        });
                    });

                    describe('the provided function', function() {
                        var get;

                        beforeEach(function() {
                            get = compileFn.calls.mostRecent().args[0];
                        });

                        it('should be an accessor for the new', function() {
                            expect(get()).toBe(data);
                            expect(get('dims')).toBe(data.dims);
                            expect(get('classes.p.name')).toBe(data.classes.p.name);
                            expect(get('this.does.not.exist')).toBeUndefined();
                        });
                    });
                });

                describe('without options', function() {
                    beforeEach(function() {
                        parseFn.calls.reset();
                        compile = tb.parse($testBox[0]);
                    });

                    it('should call the directive parseFn with no context', function() {
                        $.each($testBox.find('div'), function(index, element) {
                            expect(parseFn).toHaveBeenCalledWith(element, undefined);
                        });
                    });
                });
            });
        });

        describe('tb.parse(node, options)', function() {
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

                describe('if called again', function() {
                    beforeEach(function() {
                        model = {
                            dims: {
                                width: 300,
                                height: 100
                            },
                            classes: {
                                p: {
                                    name: 'texty'
                                }
                            },
                            name: 'Jessica Minzner',
                            img: 'foo.jpg'
                        };

                        compile(model);
                    });

                    it('should update the attributes', function() {
                        var $testAttrStyle = $testBox.find('#test-attr-style');
                        var $testAttrClass = $testBox.find('#test-attr-class');
                        var $testAttrPrefix = $testBox.find('#test-attr-prefix');

                        expect($testAttrStyle.attr('style')).toBe('width: 300px; height: 100px;');
                        expect($testAttrClass.attr('class')).toBe('texty');
                        expect($testAttrPrefix.attr('src')).toBe('foo.jpg');
                    });

                    it('should update the text', function() {
                        var $testTextP = $testBox.find('#test-text-p');
                        var $testTextMultiple = $testBox.find('#test-text-multiple');

                        expect($testTextP.text()).toBe('Hello. My Name is Jessica Minzner!');
                        expect($testTextMultiple.text()).toBe('Jessica Minzner is Jessica Minzner!');
                    });
                });
            });
        });
    });
}());
