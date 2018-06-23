import { throttle } from "./utils/throttle";
import { enqueue } from "./utils/enqueue";
import { sign, clamp, getRatio } from "./utils/math";
import { $, setAttr, setProp, win, root } from "./utils/dom";

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
export default function(opts) {
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
