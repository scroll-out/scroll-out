var ScrollOut = (function () {
    'use strict';

    function throttle(fn) {
        var time = Date.now();
        return function() {
            if (time + 17 - Date.now() < 0) {
                time = Date.now();
                fn();
            }
        };
    }

    function noop() {}

    /**
     * Defers execution and handles all calls to this function in a frame all at once.
     * This is used to prevent ping-pong read/writes to the browser while still maintaining
     * code that looks like setAttribute and setProperty are being called in place.
     * @param {Function} fn
     */
    function enqueue(fn) {
        if (fn) {
            var id, queue;

            var clearQueue = function() {
                id = 0;
                queue.some(function(q) {
                    fn.apply(null, q);
                });
            };

            return function() {
                if (!id) {
                    queue = [];
                    id = requestAnimationFrame(clearQueue);
                }
                queue.push(arguments);
            };
        }
        return noop;
    }

    /**
     * @param {number} x
     */
    function sign(x) {
        return (x > 0) - (x < 0);
    }

    /**
     *
     * @param {number} v
     * @param {number} min
     * @param {number} max
     */
    function clamp(v, min, max) {
        return min > v ? min : max < v ? max : v;
    }

    /**
     *
     * @param {number} p0
     * @param {number} s0
     * @param {number} p1
     * @param {number} s1
     */
    function getRatio(p0, s0, p1, s1) {
        return (clamp(p0 + s0, p1, p1 + s1) - clamp(p0, p1, p1 + s1)) / s0;
    }

    var win = window;
    var root = document.documentElement; 

    /**
     * find elements
     * @param {Node | Node[] | NodeList | string} e
     * @param {Node} param
     * @returns {HTMLElement[]}
     */
    function $(e, parent) {
        return !e || e.length == 0
            ? // null or empty string returns empty array
              []
            : e.nodeName
                ? // a single element is wrapped in an array
                  [e]
                : // selector and NodeList are converted to Element[]
                  [].slice.call(e[0].nodeName ? e : (parent || root).querySelectorAll(e));
    }

    var setAttr = enqueue(function(el, name, value) {
      el.setAttribute("data-" + name, value);
    });

    var setProp = enqueue(function(el, name, value) {
      el.style.setProperty("--" + name, value);
    });

    var SCROLL = "scroll";
    var RESIZE = "resize";
    var SCROLL_DIR = "scroll-dir-";
    var PERCENT_VISIBLE = "percent-visible-";
    var on = "addEventListener";
    var off = "removeEventListener";
    var X = "x";
    var Y = "y";

    function changeAndDetect(obj, key, value) {
        return obj[key] == (obj[key] = value);
    }

    /**
     * Creates a new instance of ScrollOut that marks elements in the viewport with an "in" class
     * and marks elements outside of the viewport with an "out"
     * @param {IScrollOutOptions} opts
     */
    function main(opts) {
        // set default options
        opts = opts || {};

        var onChange = enqueue(opts.onChange);
        var onHidden = enqueue(opts.onHidden);
        var onShown = enqueue(opts.onShown);

        var container = $(opts.scrollingElement || win)[0];
        var doc = $(opts.scrollingElement || root)[0];

        /** @type {HTMLElement[]} */
        var elements;

        var position = [0, 0];

        var update = throttle(function() {
            // calculate position, direction and ratio
            var cx = doc.scrollLeft || win.pageXOffset;
            var cy = doc.scrollTop || win.pageYOffset;
            var cw = doc.clientWidth;
            var ch = doc.clientHeight;

            var directionX = sign(cx - position[0]);
            var directionY = sign(cy - position[1]);

            // save the current data for comparison
            position = [cx, cy];

            // call update to dom
            if (changeAndDetect(doc, '_sd', directionX * directionY)) {
                setAttr(doc, SCROLL_DIR + X, directionX);
                setAttr(doc, SCROLL_DIR + Y, directionY);
                setProp(doc, SCROLL_DIR + X, directionX);
                setProp(doc, SCROLL_DIR + Y, directionY);
            }

            elements = elements.filter(function(el) {
                // get element dimensions
                var x = el.offsetLeft;
                var y = el.offsetTop;
                var w = el.clientWidth;
                var h = el.clientHeight;

                // find visible ratios for each element
                var visibleX = getRatio(x, w, cx, cw);
                var visibleY = getRatio(y, h, cy, ch);

                if (changeAndDetect(el, '_sv', visibleX * visibleY)) {
                    // if percentage visibility has changed, update
                    setProp(el, PERCENT_VISIBLE + X, visibleX);
                    setProp(el, PERCENT_VISIBLE + Y, visibleY);
                }

                // identify if this is visible "enough"
                var visible = opts.offset ? opts.offset <= cy : (opts.threshold || 0) < visibleX * visibleY;

                // handle callbacks
                if (changeAndDetect(el, '_so', visible)) {
                    setAttr(el, SCROLL, visible ? "in" : "out");

                    // create context for callbacks
                    var ctx = {
                        x: x,
                        y: y,
                        w: w,
                        h: h,
                        visible: visible,
                        visibleX: visibleX,
                        visibleY: visibleY
                    };

                    onChange(el, ctx, doc);
                    (visible ? onShown : onHidden)(el, ctx, doc);
                }

                // if this is shown multiple times, put it back in the list
                return !(visible && opts.once);
            });
        });

        var index = throttle(function() {
            elements = $(opts.targets || "[data-scroll]", $(opts.scope || doc)[0]);
            update();
        });

        // run initialize index
        index();

        // hook up document listeners to automatically detect changes
        win[on](RESIZE, index);
        container[on](SCROLL, index);

        return {
            index: index,
            update: update,
            teardown: function() {
                win[off](RESIZE, update);
                container[off](SCROLL, update);
            }
        };
    }

    return main;

}());
