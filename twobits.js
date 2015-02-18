module.exports = (function() {
    'use strict';

    var matcher = /{{.+?}}/g,
        attrPrefix = /^tb-/;

    var directives = [];

    var matches = (function() {
        var proto = Element.prototype;
        var fn = proto.matches ||
            proto.webkitMatchesSelector ||
            proto.mozMatchesSelector ||
            proto.msMatchesSelector;

        return function(element, selector) {
            return element instanceof Element && fn.call(element, selector);
        };
    }());

    function arrayFrom(arrayLike) {
        var length = arrayLike.length;
        var array = [];

        while (length--) {
            array[length] = arrayLike[length];
        }

        return array;
    }

    function forEach(array, cb) {
        var length = (array || []).length,
            index = 0;

        for ( ; index < length; index++) {
            cb(array[index], index);
        }
    }

    function map(array, cb) {
        var result = [];

        forEach(array, function(item, index) {
            result[index] = cb(item, index);
        });

        return result;
    }

    function forEachNode(root, cb) {
        cb(root);

        forEach(arrayFrom(root.childNodes), function(node) {
            forEachNode(node, cb);
        });
    }

    function get(object, property) {
        var props = (property || '').split('.') || undefined;

        return props && props.reduce(function(object, prop) {
            return object && object[prop];
        }, object);
    }

    function compile(template, keys, object) {
        var string = '';

        forEach(template, function(part, index) {
            string += part + (get(object, keys[index]) || '');
        });

        return string;
    }

    function keysOfTemplate(template) {
        return map(template.match(matcher), function(match) {
            return match.substring(2, match.length - 2);
        });
    }

    return {
        clear: function() {
            directives.length = 0;
        },

        directive: function(matcher, parseFn) {
            directives.push({
                matcher: matcher,
                parse: parseFn
            });

            return this;
        },

        parse: function(root) {
            var nodes = [];
            var compileFns = [];

            forEachNode(root, function(node) {
                var item,
                    keys;

                forEach(directives, function(directive) {
                    if (matches(node, directive.matcher)) {
                        compileFns.push(directive.parse(node));
                    }
                });

                if (node instanceof Text && (keys = keysOfTemplate(node.textContent)).length) {
                    item = {
                        attributes: null,
                        text: {
                            template: node.textContent.split(matcher),
                            keys: keys,
                            node: node
                        }
                    };
                }

                forEach(node.attributes, function(attr) {
                    var value = attr.value,
                        name = attr.name;

                    if ((keys = keysOfTemplate(value)).length) {
                        if (attrPrefix.test(name)) {
                            name = name.replace(attrPrefix, '');

                            node.setAttribute(name, '');
                            attr = node.attributes[name];
                        }

                        (item || (item = {
                            attributes: [],
                            text: null
                        })).attributes.push({
                            template: value.split(matcher),
                            keys: keys,
                            domAttr: attr
                        });
                    }
                });

                if (item) {
                    nodes.push(item);
                }
            });

            return function(context) {
                function getter(prop) {
                    return prop ? get(context, prop) : context;
                }

                forEach(nodes, function(node) {
                    var text;

                    /* jshint boss:true */
                    if (text = node.text) {
                    /* jshint boss:false */
                        text.node.textContent = compile(text.template, text.keys, context);
                    }

                    if (node.attributes) {
                        forEach(node.attributes, function(attr) {
                            attr.domAttr.value = compile(attr.template, attr.keys, context);
                        });
                    }
                });

                forEach(compileFns, function(fn) { fn(getter); });
            };
        }
    };
}());
