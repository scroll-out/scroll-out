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
    var lastCheck, lastViewStart, timeout, elements, viewStart, viewEnd;

    var index = function() {
        elements = $(targets, scope).reverse();
        check();
    };

    var update = function() {
        timeout = 0;

        for (var i = elements.length - 1; i > -1; --i) {
            var element = elements[i];

            // figure out if visible
            var show = false;
            if (opts.offset) {
                show = opts.offset <= viewStart;
            } else {
                var es = element.offsetTop;
                var h = element.offsetHeight;
                show = threshold < (clamp(es + h, viewStart, viewEnd) - clamp(es, viewStart, viewEnd)) / h;
            }

            // if last state is not the same, flip the classes
            if (element._SO_ !== show) {
                // set the new state. we do this on the element, so re-queries pick up the correct state
                element._SO_ = show;

                // set new state of class
                element.classList.toggle(inClass, show);
                element.classList.toggle(outClass, !show);

                // handle callbacks
                (opts.onChange || noop)(element, show);
                ((show ? opts.onShown : opts.onHidden) || noop)(element); 
            }

            // if this is shown multiple times, put it back in the list
            if (show && opts.once) {
                elements.splice(i, 1);
            }
        }

        lastViewStart = viewStart;
    };

    var check = function() {
        viewEnd = (viewStart = doc.scrollTop) + doc.clientHeight;
        if (elements.length && lastViewStart !== viewStart) {
            timeout = timeout || setTimeout(update, opts.delay || 40);
        }
    };

    // run initialize index and check
    index();

    // hook up document listeners to automatically detect changes
    var events = [[resize, index], [resize, check], [scroll, check]];

    events.some(function(e) {
        win.addEventListener(e[0], e[1]);
    });

    return {
        index: index,
        update: update,
        teardown: function() {
            events.some(function(e) {
                win.removeEventListener(e[0], [1]);
            });
        }
    };
};

return main;

}());
