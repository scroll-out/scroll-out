import { throttle } from "./utils/throttle";
import { enqueue } from "./utils/enqueue";
import { sign, clamp } from "./utils/math";
import { $, setAttrs, setProps, win, root } from "./utils/dom";
import { noop } from "./utils/noop";
import { IScrollOutOptions } from "./types";

const SCROLL = "scroll";
const RESIZE = "resize";
const ON = "addEventListener";
const OFF = "removeEventListener";
let lastId = 0;

/**
 * Creates a new instance of ScrollOut that marks elements in the viewport with an "in" class
 * and marks elements outside of the viewport with an "out"
 */
export default function(opts: IScrollOutOptions) {
    // set default options
    opts = opts || {};

    const onChange = enqueue(opts.onChange);
    const onHidden = enqueue(opts.onHidden);
    const onShown = enqueue(opts.onShown);
    const props = opts.cssProps ? setProps(opts.cssProps) : noop;

    const se = opts.scrollingElement;
    const container = se ? $(se)[0] : win;
    const doc = se ? $(se)[0] : root;
    const id = ++lastId;

    const changeAndDetect = (obj, key, value) => {
        return obj[key + id] != (obj[key + id] = value);
    };

    let elements: HTMLElement[], isResized: 1 | 0;
    const index = throttle(function() {
        isResized = 1;
        elements = $(opts.targets || "[data-scroll]", $(opts.scope || doc)[0]);
        update();
    });

    let cx: number, cy: number;
    const update = throttle(() => {
        // calculate position, direction and ratio
        const cw = doc.clientWidth;
        const ch = doc.clientHeight;
        const dirX = sign(-cx + (cx = doc.scrollLeft || win.pageXOffset));
        const dirY = sign(-cy + (cy = doc.scrollTop || win.pageYOffset));
        const scrollPercentX = doc.scrollLeft / (doc.scrollWidth - cw || 1);
        const scrollPercentY = doc.scrollTop / (doc.scrollHeight - ch || 1);

        // call update to dom
        if (dirX | dirY && changeAndDetect(doc, "_sd", (dirX | dirY) + scrollPercentX + scrollPercentY)) {
            setAttrs(doc, {
                scrollDirX: dirX,
                scrollDirY: dirY
            });
            props(doc, {
                scrollDirX: dirX,
                scrollDirY: dirY,
                scrollPercentX: scrollPercentX,
                scrollPercentY: scrollPercentY
            });
        }

        elements = elements.filter(el => {
            // get element dimensions
            const x = el.offsetLeft;
            const y = el.offsetTop;
            const w = el.clientWidth;
            const h = el.clientHeight;

            // find visible ratios for each element
            const visibleX = (clamp(x + w, cx, cx + cw) - clamp(x, cx, cx + cw)) / w;
            const visibleY = (clamp(y + h, cy, cy + ch) - clamp(y, cy, cy + ch)) / h;

            const ctx = {
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
            const visible = (ctx.visible = +(opts.offset
                ? opts.offset <= cy
                : (opts.threshold || 0) < visibleX * visibleY));

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
        teardown() {
            win[OFF](RESIZE, index);
            container[OFF](SCROLL, update);
        }
    };
}
