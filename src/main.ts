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
        return obj[key + id] != (obj[key + id] = JSON.stringify(value));
    };

    let elements: HTMLElement[] = []; 
    const index = throttle(function() {
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
        const pCtx = {
            scrollDirX: dirX,
            scrollDirY: dirY,
            scrollPercentX: scrollPercentX,
            scrollPercentY: scrollPercentY
        }

        if (dirX | dirY && changeAndDetect(doc, "_S", pCtx)) {
            setAttrs(doc, {
                scrollDirX: dirX,
                scrollDirY: dirY
            });
            props(doc, pCtx);
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
            var viewportX = clamp((cx - (((w / 2) + x) - (cw / 2))) / (cw / 2), -1, 1);
            var viewportY = clamp((cy - (((h / 2) + y) - (ch / 2))) / (ch / 2), -1, 1); 

            const ctx = {
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
            const visible = (ctx.visible = +(opts.offset
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
        teardown() {
            win[OFF](RESIZE, index);
            container[OFF](SCROLL, update);
        }
    };
}
