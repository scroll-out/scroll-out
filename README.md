# ScrollOut

*Animate on Scroll*


[![npm version](https://badge.fury.io/js/scroll-out.svg)](https://badge.fury.io/js/scroll-out) [![Downloads](https://img.shields.io/npm/dm/scroll-out.svg)](https://www.npmjs.com/package/scroll-out)
[![gzip size](http://img.badgesize.io/https://unpkg.com/scroll-out/dist/scroll-out.min.js?compression=gzip&label=gzip%20size&style=flat&cache=false)](https://unpkg.com/scroll-out/dist/scroll-out.min.js) 

## Why should I use this?
- Animate or reveal elements as they scroll into view using CSS or JavaScript
- Super tiny JavaScript library at 1KB minified.
- Free for commercial and non-commercial use under the MIT license.

## How do I use it?

Install ScrollOut and decorate elements with the ```scroll-out``` class.  As elements become visible, ```scroll-out``` with be replaced with ```scroll-in``` and vice-versa.  Add your own CSS or JS to make a big impression when things come into view.  That's it!

## Tips (How do I?...)

### Perform a Fade In with CSS


Add these classes to your css
```css
.fade-in {
  transition: opacity 1s;
}
.fade-in.scroll-in {
  opacity: 1;
}
.fade-in.scroll-out {
  opacity: 0;
}
```

Add this to your page
```html
<script> ScrollOut(); </script>
```


### Force a CSS Animation to replay
When using animate.css, you may need to force the animation to play a second time.  Luckily there is a handy way to force the browser to reflow the document and replay the animation:

```js
ScrollOut({
  inClass: 'animated',
  onVisible: function(el) {
    // remove the class
    el.classList.remove('animated');

    // force reflow
    void el.offsetWidth;

    // re-add the animated cl
    el.classList.add('animated');
  }
})
```

### Perform a Fade with JavaScript the first time an element appears


```js
ScrollOut({ 
  onShown: function(el) {
    // use the web animation API
    el.animate([{ opacity: 0 }, { opacity: 1 }], 1000);
  },
  onHidden: function(el) {
    // hide the element initially
    el.style.opacity = 0;
  }
})
```

> This code sample uses the Web Animation API (Available on Chrome and FireFox). The general idea works for any animation library.

### Use ScrollOut with a JS Framework
Most JS frameworks have setup/teardown methods that should be used when using ScrollOut.

#### Vue
```js
export default {
  data() {
    return {
      so: undefined
    }
  },
  mounted() {
    this.so = ScrollOut({
      scope: this.$el
    });
  },
  destroyed() {
    this.so.teardown();
  }
})
```

#### Angular
```ts
@Component(/**/)
export class MyComponent implements AfterContentInit, OnDestroy {
  so: any;

  constructor(private el: ElementRef) {}

  ngAfterContentInit() {
    this.so = ScrollOut({
      scope: this.el.nativeElement
    });
  }

  ngOnDestroy() {
    this.so.teardown();
  }
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

### Configuration
|Options|Description|
|:-|:-|
|scope|The top level element.  By default this is document. A css selector can also be used, but only the first match will be watched|
|targets|An optional list of elements or a css selector.  By default, the the inClass and outClass are selected.|
|inClass|The class name to assign when the element is in the viewport.  Default value is "scroll-in". To use with animate.css, assign this to "animated"|
|outClass|The class name to assign when the element is not in the viewport.  Default value is "scroll-out".|
|once|Elements will only be changed from scroll-out to scroll-in once.  This is useful if you want to transition all elements exactly once.  The default value is false.|
|delay|The amount of time in milliseconds to throttle detecting if elements are in view. By default this is 40 milliseconds.| 
|offset|The targets become visible when they reach this distance in pixels from the top of the screen. Setting this option overrides all other collision detection|
|threshold|The ratio of the element that must be visible before it is marked as visible. Providing the value 0.2 would require 20% of the element to be visible before marking it visible|

### Events
|Event|Description|
|:-|:-|
|onShown(element)|callback for when an element is show|
|onHidden(element)|Callback for when an element is hidden|
|onChange(element, visible)|Callback for when an element changes visibility|

## ScrollOut Methods

### index()
Manually searches for elements.  This is intended for when DOM elements are removed or inserted by a JS framework.

### update()
Manually checks if the elements have been updated.  This is intended for when a JS framework changes the visual layout of the DOM.

### teardown()
If you no longer need a ScrollOut instance, call the ```teardown()``` function:


## License

scroll-out is licensed under the [MIT license](http://opensource.org/licenses/MIT).