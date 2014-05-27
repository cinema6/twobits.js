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
