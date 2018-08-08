import { throttle } from "./utils/throttle";
import { enqueue } from "./utils/enqueue";
import { sign, clamp } from "./utils/math";
import { $, setAttrs, setProps, win, root } from "./utils/dom";
import { noop } from "./utils/noop";
import { IScrollOutOptions } from "./types";

var SCROLL = "scroll";
var RESIZE = "resize";
var ON = "addEventListener";
var OFF = "removeEventListener";
var lastId = 0;

/**
 * Creates a new instance of ScrollOut that marks elements in the viewport with an "in" class
 * and marks elements outside of the viewport with an "out" 
 */
export default function(opts: IScrollOutOptions) {
    // set default options
    opts = opts || {};

    var onChange = enqueue(opts.onChange);
    var onHidden = enqueue(opts.onHidden);
    var onShown = enqueue(opts.onShown);
    var props = opts.cssProps ? setProps : noop;
    
    var se = opts.scrollingElement;
    var container = se ? $(se)[0] : win;
    var doc = se ? $(se)[0] : root;
    var id = ++lastId;

    var changeAndDetect = function(obj, key, value) {
        return obj[key + id] != (obj[key + id] = value);
    };
 
    var elements: HTMLElement[], isResized: 1 | 0;
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
            var visibleX = (clamp(x + w, cx, cx + cw) - clamp(x, cx, cx + cw)) / w;
            var visibleY = (clamp(y + h, cy, cy + ch) - clamp(y, cy, cy + ch)) / h; 

            var ctx = {
                visibleX: visibleX,
                visibleY: visibleY,
                visible: 0,
                offsetX: x,
                offsetY: y,
                elementWidth: w,
                elementHeight: h,
                intersectX: visibleX == 1 ? 0 : sign(x - cx),
                intersectY: visibleY == 1 ? 0 : sign(y - cy)
            };

            // identify if this is visible "enough"
            var visible = ctx.visible = +(opts.offset ? opts.offset <= cy : (opts.threshold || 0) < visibleX * visibleY)

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
