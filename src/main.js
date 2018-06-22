/** @type import('../types').IScrollOutOptions */

var _ = void 0;
var win = window;
var root = document.documentElement;
var SCROLL = "scroll";
var RESIZE = "resize";
var SCROLL_DIR = "scroll-dir-";
var SCROLL_DIR_AVERAGE = "scroll-avg-";
var PERCENT_VISIBLE = "percent-visible-";
var X = "x";
var Y = "y";

function noop() {}

function sum(c, n) {
    return c + n;
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

/**
 * Defers execution and handles all calls to this function in a frame all at once.
 * This is used to prevent ping-pong read/writes to the browser while still maintaining
 * code that looks like setAttribute and setProperty are being called in place.
 * @param {Function} fn
 */
function queued(fn) {
    if (fn) {
        var id, queue;

        var clearQueue = function() {
            id = queue.some(function(q) {
                fn.apply(_, q);
            });
        };

        return function() {
            id = id || ((queue = []) && requestAnimationFrame(clearQueue));
            queue.push(arguments);
        };
    }
    return noop;
}

var setAttr = queued(function(el, name, value) {
    el.setAttribute("data-" + name, value);
});

var setVar = queued(function(el, name, value) {
    el.style.setProperty("--" + name, value);
});

/**
 * Creates a new instance of ScrollOut that marks elements in the viewport with an "in" class
 * and marks elements outside of the viewport with an "out"
 * @param {IScrollOutOptions} opts
 */
export default function(opts) {
    // set default options
    opts = opts || {};
    var change = queued(opts.onChange);
    var hidden = queued(opts.onHidden);
    var shown = queued(opts.onShown);
    var vars = queued(window.CSS && CSS.supports("--", 0) && setVar);

    var container = $(opts.scrollingElement || win)[0];
    var doc = $(opts.scrollingElement || root)[0];

    // define locals
    var timeout;
    /** @type {HTMLElement[]} */
    var elements;

    var position = [0, 0];
    var samples = [];

    function sample(n) {
        samples.push(n);
        samples.length > 40 && samples.shift();
        return 2 * samples.reduce(sum, 0) / samples.length;
    }

    function index() {
        elements = $(opts.targets || "[data-scroll]", $(opts.scope || doc)[0]);
        update();
    }

    function update() {
        // prettier-ignore
        timeout = timeout || setTimeout(function() {
            timeout = _;

            // calculate position, direction and ratio
            var cx = doc.scrollLeft || win.pageXOffset;
            var cy = doc.scrollTop || win.pageYOffset;
            var cw = doc.clientWidth;
            var ch = doc.clientHeight;
            var directionX = sign(cx - position[0]);
            var directionY = sign(cy - position[1]);
            var averageX = sample(directionX);
            var averageY = sample(directionY);

            // save the current data for comparison
            position = [cx, cy];

            // mark the browser with the current direction
            setAttr(doc, SCROLL_DIR + X, directionX);
            setAttr(doc, SCROLL_DIR + Y, directionY);
            vars(doc, SCROLL_DIR + X, directionX);
            vars(doc, SCROLL_DIR_AVERAGE + X, averageX);
            vars(doc, SCROLL_DIR + Y, directionY);
            vars(doc, SCROLL_DIR_AVERAGE + Y, averageY);

            elements = elements.filter(function(element) {         
                // get element dimensions
                var x = element.offsetLeft;
                var w = element.clientWidth;
                var y = element.offsetTop;
                var h = element.clientHeight;

                // find visible ratios for each element
                var visibleX = getRatio(x, w, cx, cw);
                var visibleY = getRatio(y, h, cy, ch);

                // identify if this is visible "enough"
                var visible = opts.offset 
                    ? opts.offset <= cy 
                    : (opts.threshold || 0) < visibleX * visibleY

                // set the new state. we do this on the element, so re-queries pick up the correct state
                setAttr(element, SCROLL, visible ? "in" : "out");

                // create context for callbacks
                var ctx = {
                    visible: visible,
                    visibleX: visibleX,
                    visibleY: visibleY
                }

                // handle callbacks
                change(element, ctx, doc);
                (visible ? shown : hidden)(element, ctx, doc);

                // set 
                vars(element, PERCENT_VISIBLE + X, visibleX);
                vars(element, PERCENT_VISIBLE + Y, visibleY);

                // if this is shown multiple times, put it back in the list
                return !(visible && opts.once);
            });
        }, 17);
    }

    // run initialize index and check
    index();

    // hook up document listeners to automatically detect changes
    var events = [{ $: win, f: index, e: RESIZE }, { $: container, f: update, e: SCROLL }];

    events.some(function(o) {
        o.$.addEventListener(o.e, o.f);
    });

    return {
        index: index,
        update: update,
        teardown: function() {
            events.some(function(o) {
                o.$.removeEventListener(o.e, o.f);
            });
        }
    };
}
