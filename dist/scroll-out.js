var ScrollOut = (function () {
'use strict';

var win = window;
var doc = document;
var resize = "resize";
var scroll = "scroll";
var defaultInClass = "scroll-in";
var defaultOutClass = "scroll-out";

function noop() {}

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
    var lastCheck,
        lastScroll,
        timeout,
        rects,
        offset = 0,
        scrollTop = 0;

    // set default options
    var opts = opts || {};

    var inClass = opts.inClass || defaultInClass;
    var outClass = opts.outClass || defaultOutClass;
    var targets = opts.targets || "." + inClass + ",." + outClass;

    var scope = $(opts.scope || doc)[0];

    var index = function() {
        rects = $(targets, scope).map(function(el) {
            return {
                L: el,
                R: el.getBoundingClientRect()
            }
        });
    };

    var update = function() {
        timeout = 0;
        var height = win.innerHeight;

        for (var i = rects.length - 1; i > -1; --i) {
            var rect = rects[i];
            // figure out if visible
            var show = rect.R.bottom > scrollTop && rect.R.top < scrollTop + height - height * offset;
            // if last state is not the same, flip the classes
            if (rect.S !== show) {
                var el = rect.L;

                // set new state of class
                el.classList.toggle(inClass, show);
                el.classList.toggle(outClass, !show);

                // handle callbacks
                (opts.onChange || noop)(el, show);
                ((show ? opts.onVisible : opts.onHidden) || noop)(el);
            }
            // set the new state
            rect.S = show;

            // if this is shown multiple times, put it back in the list
            if (show && opts.once) {
                result.splice(i, 1);
            }
        }

        lastScroll = scrollTop;
    };

    var check = function() {
        if (rects.length && lastScroll !== scrollTop) {
            timeout = timeout || setTimeout(update, opts.delay || 40);
        }
    };

    var onScroll = function() {
        scrollTop = win.pageYOffset;
        check();
    };

    // run initialize index and check
    index();
    check();

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
