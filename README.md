twobits.js
==========

A lightweight template library for the DOM.

## Getting Started

Use TwoBits.js is easy!

```html
<!DOCTYPE html>
<html>
    <head>
        <title>My Awesome Page</title>
        <script src="twobits.js"></script><!-- Include TwoBits -->
    </head>
    <body>
        <section id="dynamic">
            <p>{{user.name}} works at {{user.company}}!</p>
        </section>
        <script>
            // Use TwoBits!
            var data = {
                user: {
                    name: 'Josh',
                    company: 'Cinema6'
                }
            };

            var updateDOM = tb.parse(document.getElementById('dynamic'));

            updateDOM(data);
            // The <p> above will now contain "Josh works at Cinema6!"

            setTimeout(function() {
                data.user.name = 'Evan';
                updateDOM(data);
                // Now (after three seconds) the <p> will contain "Evan works at Cinema6!"
            }, 3000);
        <script>
    </body>
<html>
```

## API

### `tb.parse(root, [options])`
* Parameters:
    * **root** (`Element`): A DOM element to parse.
    * **options** *optional* (`Object`): May contain the following properties:
        * **context** (any): A value that will be passed as the second argument to each directive `parseFn`.
        * **filter** (`Function`): If provided, this function will be invoked recursively with each child element of the `root`. If the filter returns a falsy value, the `Element` and all of its children will not be parsed.
* Returns:
    * **compile(context)** (`Function`): A function that, when called, will update the `root` with provided `context` data

### `tb.directive(matcher, parseFn)`
* Parameters:
    * **matcher** (`String`): CSS selector that will determine the `Element`s to which the directive will be applied.
    * **parseFn** (`Function`): A function that will invoked for each `Element` that matches `matcher` with the `Element` and `options.context` (passed to `tb.parse()` if provided) when `tb.parse()` is invoked.

      `parseFn` should return a `Function`, `compile`, that will be invoked with a `Function`, `get`, whenever the compile `Function` returned by `tb.parse` is invoked. The `Function`, `get`, accepts a `String` that can look-up property values on the `context` using the same algorithm as curly braces in tempaltes. Here is an example of a directive that hides/shows an `Element`:
      
      ```javascript
      tb.directive('[data-show]', function(element) {
          var prop = element.getAttribute('data-show');
          
          return function(get) {
              if (get(prop)) {
                   element.style.display = 'none';
              } else {
                   element.style.display = '';
              }
          };
      });
      ```
      ```html
      <div id="example" data-show="should.show">Hello world!</div>
      ```
      ```javascript
      var compile = tb.parse(document.getElementById('example'));
      
      compile({ should: { show: true } }); // Element will be shown.
      compile({ should: { show: false } }); // Element will be hidden.
      ```
* Returns:
    * **tb**: The twobits object, to enable a chaining API

### `tb.clear()`
Clears any global twobits state, most notably any registered directives.