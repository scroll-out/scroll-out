var ScrollOut = (function () {
    'use strict';

    function throttle(fn) {
        var lastId;
        var time = Date.now();
        return function() {
            if (time + 17 - Date.now() < 0) {
                lastId = 0;
                time = Date.now();
                fn();
            } else {
                // ensure that if there is a skipped action, that it will fire
                // if the timeout occurs and no other actions occur
                lastId = lastId || setTimeout(fn, 17);
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
                    fn.apply(0, q);
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

    /**
     * @param {number} x
     */
    function sign(x) {
        return (x > 0) - (x < 0);
    }

    var cache = {};
    function hyphenate(value) {
        return cache[value] ||(cache[value] = value.replace(/([A-Z])/g, replacer));
    }

    function replacer(match) {
        return '-' + match[0].toLowerCase()
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

    var setAttrs = enqueue(function(el, attrs) {
      for (var key in attrs) {
        el.setAttribute("data-" + hyphenate(key), attrs[key]);
      }
    });

    var setProps = enqueue(function(el, props) {
      for (var key in props) {
        el.style.setProperty("--" + hyphenate(key), props[key]);
      }
    });

    var SCROLL = "scroll";
    var RESIZE = "resize";
    var ON = "addEventListener";
    var OFF = "removeEventListener";
    var lastId = 0;

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
        var props = opts.cssProps ? setProps : noop;
        
        var container = $(opts.scrollingElement || win)[0];
        var doc = $(opts.scrollingElement || root)[0];
        var id = ++lastId;

        var changeAndDetect = function(obj, key, value) {
            return obj[key + id] != (obj[key + id] = value);
        };

        /** @type {HTMLElement[]} */
        var elements, isResized;
        var index = throttle(function() {
            isResized = 1;
            elements = $(opts.targets || "[data-scroll]", $(opts.scope || doc)[0]);
            update();
        });

        var cx, cy;
        var update = throttle(function() {
            // calculate position, direction and ratio
            var cw = doc.clientWidth;
            var ch = doc.clientHeight;

            var dirX = sign(-cx + (cx = doc.scrollLeft || win.pageXOffset));
            var dirY = sign(-cy + (cy = doc.scrollTop || win.pageYOffset));

            // call update to dom
            if (dirX | dirY && changeAndDetect(doc, "_sd", dirX | dirY)) {
                var ctx = {
                    scrollDirX: dirX,
                    scrollDirY: dirY
                };
                setAttrs(doc, ctx);
                props(doc, ctx);
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

                var ctx = {
                    visibleX: visibleX,
                    visibleY: visibleY,
                    offsetX: x,
                    offsetY: y,
                    elementWidth: w,
                    elementHeight: h
                };

                // identify if this is visible "enough"
                var visible = ctx.visible = +(opts.offset ? opts.offset <= cy : (opts.threshold || 0) < visibleX * visibleY);

                if (changeAndDetect(el, "_sv", visibleX + visibleY + visible) || isResized) { 
                    // if percentage visibility has changed, update
                    props(el, ctx);
                }

                // handle callbacks
                if (changeAndDetect(el, "_so", visible)) {
                    setAttrs(el, {
                        scroll: visible ? "in" : "out"
                    });

                    onChange(el, ctx, doc);
                    (visible ? onShown : onHidden)(el, ctx, doc);
                }

                // if this is shown multiple times, keep it in the list
                return !visible || !opts.once;
            });

            isResized = 0;
        });

        // run initialize index
        index();

        // hook up document listeners to automatically detect changes
        win[ON](RESIZE, index);
        container[ON](SCROLL, update);

        return {
            index: index,
            update: update,
            teardown: function() {
                win[OFF](RESIZE, index);
                container[OFF](SCROLL, update);
            }
        };
    }

    return main;

}());
