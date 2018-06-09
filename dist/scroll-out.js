var ScrollOut = (function () {
'use strict';

var win = window;
var doc = document.documentElement;
var resize = "resize";
var scroll = "scroll";

function noop() {}

function clamp(v, min, max) {
    return min > v ? min : max < v ? max : v;
}

/** find elements */
function $(e, parent) {
    return !e || e.length == 0
        ? // null or empty string returns empty array
          []
        : e.nodeName
            ? // a single element is wrapped in an array
              [e]
            : // selector and NodeList are converted to Element[]
              [].slice.call(e[0].nodeName ? e : (parent || doc).querySelectorAll(e));
}

var main = function(opts) {
    // set default options
    var opts = opts || {};
    var threshold = opts.threshold || 0;
    var inClass = opts.inClass || "scroll-in";
    var outClass = opts.outClass || "scroll-out";
    var targets = opts.targets || "." + inClass + ",." + outClass;
    var scope = $(opts.scope || doc)[0];

    // define locals
    var lastCheck, lastScroll, timeout, elements, viewPortStart, viewPortEnd;

    var index = function() {
        elements = $(targets, scope).reverse();
        onScroll();
    };

    var update = function() {
        timeout = 0;

        for (var i = elements.length - 1; i > -1; --i) {
            var el = elements[i];

            // figure out if visible
            var show = false;
            if (opts.offset) {
                show = opts.offset <= viewPortStart;
            } else {
                var es = el.offsetTop;
                var h = el.offsetHeight;
                show = threshold < (clamp(es + h, viewPortStart, viewPortEnd) - clamp(es, viewPortStart, viewPortEnd)) / h;
            }

            // if last state is not the same, flip the classes
            if (el._SO_ !== show) {
                // set new state of class
                el.classList.toggle(inClass, show);
                el.classList.toggle(outClass, !show);

                // handle callbacks
                (opts.onChange || noop)(el, show);
                ((show ? opts.onShown : opts.onHidden) || noop)(el);
            }

            // set the new state. we do this on the element, so re-queries pick up the correct state
            el._SO_ = show;

            // if this is shown multiple times, put it back in the list
            if (show && opts.once) {
                elements.splice(i, 1);
            }
        }

        lastScroll = viewPortStart;
    };

    var check = function() {
        if (elements.length && lastScroll !== viewPortStart) {
            timeout = timeout || setTimeout(update, opts.delay || 40);
        }
    };

    var onScroll = function() {
        viewPortEnd = (viewPortStart = doc.scrollTop) + doc.clientHeight;
        check();
    };

    // run initialize index and check
    index();

    // hook up document listeners to automatically detect changes
    var events = [[win, resize, index], [win, resize, onScroll], [win, scroll, onScroll]];

    events.some(function(e) {
        e[0].addEventListener(e[1], e[2]);
    });

    return {
        index: index,
        update: update,
        teardown: function() {
            events.some(function(e) {
                e[0].removeEventListener(e[1], e[2]);
            });
        }
    };
};

return main;

}());
