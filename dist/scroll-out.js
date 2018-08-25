var ScrollOut = (function () {
    'use strict';

    function throttle(fn) {
        var lastId;
        var time = Date.now();
        return function () {
            if (time + 17 - Date.now() < 0) {
                lastId = 0;
                time = Date.now();
                fn();
            }
            else {
                // ensure that if there is a skipped action, that it will fire
                // if the timeout occurs and no other actions occur
                lastId = lastId || setTimeout(fn, 17);
            }
        };
    }

    function noop() { }

    /**
     * Defers execution and handles all calls to this function in a frame all at once.
     * This is used to prevent ping-pong read/writes to the browser while still maintaining
     * code that looks like setAttribute and setProperty are being called in place.
     */
    function enqueue(fn) {
        if (fn) {
            var id_1, queue_1;
            var clearQueue_1 = function () {
                id_1 = 0;
                queue_1.forEach(function (q) {
                    fn.apply(0, q);
                });
            };
            return function () {
                if (!id_1) {
                    queue_1 = [];
                    id_1 = requestAnimationFrame(clearQueue_1);
                }
                queue_1.push(arguments);
            };
        }
        return noop;
    }

    function clamp(v, min, max) {
        return min > v ? min : max < v ? max : v;
    }
    function sign(x) {
        return (x > 0) - (x < 0);
    }
    function round(n) {
        return Math.round(n * 10000) / 10000;
    }

    var cache = {};
    function hyphenate(value) {
        return cache[value] || (cache[value] = value.replace(/([A-Z])/g, replacer));
    }
    function replacer(match) {
        return "-" + match[0].toLowerCase();
    }

    var win = window;
    var root = document.documentElement;
    /** find elements */
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
    var setAttrs = enqueue(function (el, attrs) {
        for (var key in attrs) {
            el.setAttribute("data-" + hyphenate(key), attrs[key]);
        }
    });
    var setProps = function (cssProps) {
        return enqueue(function (el, props) {
            for (var key in props) {
                if (cssProps == true || cssProps[key]) {
                    el.style.setProperty("--" + hyphenate(key), round(props[key]));
                }
            }
        });
    };

    var SCROLL = "scroll";
    var RESIZE = "resize";
    var ON = "addEventListener";
    var OFF = "removeEventListener";
    var lastId = 0;
    /**
     * Creates a new instance of ScrollOut that marks elements in the viewport with an "in" class
     * and marks elements outside of the viewport with an "out"
     */
    function main (opts) {
        // set default options
        opts = opts || {};
        var onChange = enqueue(opts.onChange);
        var onHidden = enqueue(opts.onHidden);
        var onShown = enqueue(opts.onShown);
        var props = opts.cssProps ? setProps(opts.cssProps) : noop;
        var se = opts.scrollingElement;
        var container = se ? $(se)[0] : win;
        var doc = se ? $(se)[0] : root;
        var id = ++lastId;
        var changeAndDetect = function (obj, key, value) {
            return obj[key + id] != (obj[key + id] = JSON.stringify(value));
        };
        var elements;
        var index = throttle(function () {
            elements = $(opts.targets || "[data-scroll]", $(opts.scope || doc)[0]);
            update();
        });
        var cx, cy;
        var update = throttle(function () {
            // calculate position, direction and ratio
            var cw = doc.clientWidth;
            var ch = doc.clientHeight;
            var dirX = sign(-cx + (cx = doc.scrollLeft || win.pageXOffset));
            var dirY = sign(-cy + (cy = doc.scrollTop || win.pageYOffset));
            var scrollPercentX = doc.scrollLeft / (doc.scrollWidth - cw || 1);
            var scrollPercentY = doc.scrollTop / (doc.scrollHeight - ch || 1);
            // call update to dom
            var pCtx = {
                scrollDirX: dirX,
                scrollDirY: dirY,
                scrollPercentX: scrollPercentX,
                scrollPercentY: scrollPercentY
            };
            if (dirX | dirY && changeAndDetect(doc, "_S", pCtx)) {
                setAttrs(doc, {
                    scrollDirX: dirX,
                    scrollDirY: dirY
                });
                props(doc, pCtx);
            }
            elements = elements.filter(function (el) {
                // get element dimensions
                var x = el.offsetLeft;
                var y = el.offsetTop;
                var w = el.clientWidth;
                var h = el.clientHeight;
                // find visible ratios for each element
                var visibleX = (clamp(x + w, cx, cx + cw) - clamp(x, cx, cx + cw)) / w;
                var visibleY = (clamp(y + h, cy, cy + ch) - clamp(y, cy, cy + ch)) / h;
                var viewportX = clamp((cx - (((w / 2) + x) - (cw / 2))) / (cw / 2), -1, 1);
                var viewportY = clamp((cy - (((h / 2) + y) - (ch / 2))) / (ch / 2), -1, 1);
                var ctx = {
                    elementHeight: h,
                    elementWidth: w,
                    intersectX: visibleX == 1 ? 0 : sign(x - cx),
                    intersectY: visibleY == 1 ? 0 : sign(y - cy),
                    offsetX: x,
                    offsetY: y,
                    viewportX: viewportX,
                    viewportY: viewportY,
                    visible: 0,
                    visibleX: visibleX,
                    visibleY: visibleY
                };
                // identify if this is visible "enough"
                var visible = (ctx.visible = +(opts.offset
                    ? opts.offset <= cy
                    : (opts.threshold || 0) < visibleX * visibleY));
                if (changeAndDetect(el, "_SO", ctx)) {
                    // if percentage visibility has changed, update
                    props(el, ctx);
                }
                // handle callbacks
                if (changeAndDetect(el, "_SV", visible)) {
                    setAttrs(el, {
                        scroll: visible ? "in" : "out"
                    });
                    onChange(el, ctx, doc);
                    (visible ? onShown : onHidden)(el, ctx, doc);
                }
                // if this is shown multiple times, keep it in the list
                return !visible || !opts.once;
            });
        });
        // run initialize index
        index();
        // hook up document listeners to automatically detect changes
        win[ON](RESIZE, index);
        container[ON](SCROLL, update);
        return {
            index: index,
            update: update,
            teardown: function () {
                win[OFF](RESIZE, index);
                container[OFF](SCROLL, update);
            }
        };
    }

    return main;

}());
