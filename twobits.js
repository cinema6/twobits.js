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

    function existy(value) {
        return value !== undefined && value !== null;
    }

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
        if (cb(root) === false) { return; }

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

    function compile(template, values) {
        var string = '';

        forEach(template, function(part, index) {
            string += part + (existy(values[index]) ? values[index] : '');
        });

        return string;
    }

    function keysOfTemplate(template) {
        return map(template.match(matcher), function(match) {
            return match.substring(2, match.length - 2);
        });
    }

    function isDirty(entry, values) {
        var previousValues = entry.values;
        var length = previousValues.length;

        while (length--) {
            if (previousValues[length] !== values[length]) {
                entry.values = values;
                return true;
            }
        }

        return false;
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

        parse: function(root, _options_) {
            var options = _options_ || {};
            var context = options.context;
            var filter = options.filter;

            var nodes = [];
            var compileFns = [];

            forEachNode(root, function(node) {
                var item, keys;
                var isText = node instanceof Text;

                if (filter && !isText && !filter(node)) { return false; }

                forEach(directives, function(directive) {
                    if (matches(node, directive.matcher)) {
                        compileFns.push(directive.parse(node, context));
                    }
                });

                if (isText && (keys = keysOfTemplate(node.textContent)).length) {
                    item = {
                        attributes: null,
                        text: {
                            template: node.textContent.split(matcher),
                            keys: keys,
                            values: keys,
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
                            values: keys,
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
                    var values;

                    /* jshint boss:true */
                    if (text = node.text) {
                    /* jshint boss:false */
                        values = map(text.keys, getter);

                        if (isDirty(text, values)) {
                            text.node.textContent = compile(text.template, values);
                        }
                    }

                    if (node.attributes) {
                        forEach(node.attributes, function(attr) {
                            values = map(attr.keys, getter);

                            if (isDirty(attr, values)) {
                                attr.domAttr.value = compile(attr.template, values);
                            }
                        });
                    }
                });

                forEach(compileFns, function(fn) { fn(getter); });
            };
        }
    };
}());
