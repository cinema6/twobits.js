module.exports = (function() {
    var matcher = /{{.+?}}/g,
        attrPrefix = /^tb-/;

    function forEach(array, cb) {
        var length = (array || []).length,
            index = 0;

        for ( ; index < length; index++) {
            cb(array[index], index);
        }
    }

    function forEachNode(root, cb) {
        cb(root);

        forEach(root.childNodes, function(node) {
            forEachNode(node, cb);
        });
    }

    function get(object, property) {
        var props = property.split('.');

        return props.reduce(function(object, prop) {
            return object && object[prop];
        }, object);
    }

    function compile(string, object) {
        var matches = string.match(matcher);

        forEach(matches, function(match) {
            string = string.replace(
                match,
                get(
                    object,
                    match.substring(
                        2,
                        match.length - 2
                    )
                )
            );
        });

        return string;
    }

    function hasTemplate(string) {
        return matcher.test(string);
    }

    return {
        parse: function(root) {
            var nodes = [];

            forEachNode(root, function(node) {
                var item;

                if (node instanceof Text && hasTemplate(node.textContent)) {
                    item = {
                        attributes: null,
                        text: {
                            template: node.textContent,
                            node: node
                        }
                    };
                }

                forEach(node.attributes, function(attr) {
                    var value = attr.value,
                        name = attr.name;

                    if (hasTemplate(value)) {
                        if (attrPrefix.test(name)) {
                            name = name.replace(attrPrefix, '');

                            node.setAttribute(name, '');
                            attr = node.attributes[name];
                        }

                        (item || (item = {
                            attributes: [],
                            text: null
                        })).attributes.push({
                            template: value,
                            domAttr: attr
                        });
                    }
                });

                if (item) {
                    nodes.push(item);
                }
            });

            return function(context) {
                forEach(nodes, function(node) {
                    if (node.text) {
                        node.text.node.textContent = compile(node.text.template, context);
                    }

                    if (node.attributes) {
                        forEach(node.attributes, function(attr) {
                            attr.domAttr.value = compile(attr.template, context);
                        });
                    }
                });
            };
        }
    };
}());
