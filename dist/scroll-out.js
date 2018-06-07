var ScrollOut = (function () {
'use strict';

var _ = undefined;
var win = window;
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
              [].slice.call(e[0].nodeName ? e : (parent || document).querySelectorAll(e));
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
    var once = opts.once !== false;
    var delay = opts.delay || 40;
    var forceReflow = opts.forceReflow;
    var onChange = opts.onChange || noop;
    var onVisible = opts.onVisible || noop;
    var onHidden = opts.onHidden || noop;
 
    var inClass = opts.inClass || defaultInClass;
    var outClass = opts.outClass || defaultOutClass;
    var targets = opts.targets || ("." + inClass + ",." + outClass);

    var scope = $(opts.scope || document)[0];

    var index = function() {
        rects = $(targets, scope).map(function(el) {
            var rect = el.getBoundingClientRect();
            rect.L = el;
            return rect;
        });
    };

    var update = function() {
        timeout = _;
        var height = win.innerHeight;

        rects = rects.reduce(function(result, rect) {
            // figure out if visible
            var show = rect.bottom > scrollTop && rect.top < scrollTop + height - height * offset;
            // if last state is not the same, flip the classes
            if (rect.show !== show) {
                var el = rect.L;

                // set new state of class
                el.classList.toggle(inClass, show);
                el.classList.toggle(outClass, !show);

                // handle forcibly reflowing the document
                if (forceReflow) {
                    // temporarily unset all classes
                    var classValue = el.className;
                    el.className = "";

                    // trigger reflow.  this is a workaround for partially defined animations
                    void el.offsetWidth;

                    // add classes back to element
                    el.className = classValue;
                }

                // handle callbacks
                onChange(el, show);
                !show && onHidden(el);
                show && onVisible(el);
            }
            // set the new state
            rect.show = show;
            // if this is shown multiple times, put it back in the list
            (once && show) || result.push(rect);
            return result;
        }, []);

        lastScroll = scrollTop;
    };

    var check = function() {
        if (timeout === _ && rects.length && lastScroll !== scrollTop) {
            timeout = setTimeout(update, delay);
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
        teardown: function() {
            events.some(function(e) {
                e[0].removeEventListener(e[1], e[2]);
            });
        }
    };
};

return main;

}());
