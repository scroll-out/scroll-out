# ScrollOut

Animate on scroll with ease


[![npm version](https://badge.fury.io/js/scroll-out.svg)](https://badge.fury.io/js/scroll-out) [![Downloads](https://img.shields.io/npm/dm/scroll-out.svg)](https://www.npmjs.com/package/scroll-out)

## Why should I use this?
- Animate or reveal elements as they scroll into view using CSS
- Super tiny JavaScript library about 1KB minified.

## How does it work?

Install ScrollOut and decorate elements with the ```scroll-out``` class.  As elements become visible, ```scroll-out``` with be replaced with ```scroll-in``` and vice-versa.  Add your own CSS to make a big impression when things come into view.  That's it!

## Example CSS
The following CSS will fade an element in over 1 second when it comes into view:
```css
.my-class {
  transition: opacity 1s;
}
.my-class.scroll-in {
  opacity: 1;
}
.my-class.scroll-out {
  opacity: 0;
}
```

## Installation from CDN

### CDN
Include the following script in the head of your document
```html
<script src="https://unpkg.com/scroll-out/dist/scroll-out.min.js"></script>
```
On document load/ready or in a script at the bottom the of the ```<body>```, do the following:

```js
ScrollOut({ /* options */ })
```

### Installation from NPM

Install scroll-out from NPM:
```bash
npm i scroll-out -S
```

Them import ScrollOut from the package and call it

```js
import ScrollOut from 'scroll-out'

ScrollOut({ /* options */ })
```

## Options
|Options|Description|
|:-|:-|
|delay|The amount of time in milliseconds to throttle detecting if elements are in view. By default this is 40 milliseconds.|
|element|The top level element.  By default this is document|
|forceReflow|Forces reflow when adding/removing classes. This is helpful for restarting animations.|
|inClass|The class name to assign when the element is in the viewport.  Default value is "scroll-in". To use with animate.css, assign this to "animated"|
|outClass|The class name to assign when the element is not in the viewport.  Default value is "scroll-out".|
|once|Elements will only be changed from scroll-out to scroll-in once.  This is useful if you want to transition all elements exactly once.  The default value is true.|

## Methods

### teardown()
If you no longer need a ScrollOut instance, call the ```teardown()``` function:

```js
var scrollOut = ScrollOut()

/* do some stuff */

scrollOut.teardown()
```

## License

scroll-out is licensed under the [MIT license](http://opensource.org/licenses/MIT).