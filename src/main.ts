import {IScrollOutOptions} from './types';
import {$, root, setAttrs, setProps, win} from './utils/dom';
import {subscribe} from './utils/loop';
import {clamp, sign} from './utils/math';
import {noop} from './utils/noop';

const SCROLL = 'scroll';
const RESIZE = 'resize';
const ON = 'addEventListener';
const OFF = 'removeEventListener';
let lastId = 0;

/**
 * Creates a new instance of ScrollOut that marks elements in the viewport with
 * an "in" class and marks elements outside of the viewport with an "out"
 */
// tslint:disable-next-line:no-default-export
export default function(opts: IScrollOutOptions) {
  // Apply default options.
  opts = opts || {};

  // Debounce onChange/onHidden/onShown.
  const onChange = opts.onChange || noop;
  const onHidden = opts.onHidden || noop;
  const onShown = opts.onShown || noop;
  const props = opts.cssProps ? setProps(opts.cssProps) : noop;

  const se = opts.scrollingElement;
  const container = se ? $(se)[0] : win;
  const doc = se ? $(se)[0] : root;
  const id = ++lastId;

  const changeAndDetect = (obj, key, value) => {
    return obj[key + id] !== (obj[key + id] = JSON.stringify(value));
  };

  let rootCtx: Record<string, number>;
  // tslint:disable-next-line:no-any
  let elements: Array<{$: HTMLElement; ctx: Record<string, any>}>;
  let shouldIndex: boolean;
  const index = () => {
    shouldIndex = true;
  };

  let cx: number, cy: number;
  const update = () => {
    if (shouldIndex) {
      shouldIndex = false;
      elements = $(opts.targets || '[data-scroll]', $(opts.scope || doc)[0])
                     .map(el => ({$: el, ctx: {}}));
    }

    // Calculate position, direction and ratio.
    const cw = doc.clientWidth;
    const ch = doc.clientHeight;
    const dirX = sign(-cx + (cx = doc.scrollLeft || win.pageXOffset));
    const dirY = sign(-cy + (cy = doc.scrollTop || win.pageYOffset));
    const scrollPercentX = doc.scrollLeft / (doc.scrollWidth - cw || 1);
    const scrollPercentY = doc.scrollTop / (doc.scrollHeight - ch || 1);

    // Call update to dom.
    rootCtx =
        {scrollDirX: dirX, scrollDirY: dirY, scrollPercentX, scrollPercentY};

    elements.forEach(obj => {
      const el = obj.$;

      // find the distance from the element to the scrolling container
      let target = el;
      let x = 0;
      let y = 0;
      do {
        x += target.offsetLeft;
        y += target.offsetTop;
        target = target.offsetParent as HTMLElement;
      } while (target && target !== container);

      // Get element dimensions.
      const w = el.clientWidth || el.offsetWidth || 0;
      const h = el.clientHeight || el.offsetHeight || 0;

      // Find visible ratios for each element.
      const visibleX = (clamp(x + w, cx, cx + cw) - clamp(x, cx, cx + cw)) / w;
      const visibleY = (clamp(y + h, cy, cy + ch) - clamp(y, cy, cy + ch)) / h;
      const viewportX = clamp((cx - (w / 2 + x - cw / 2)) / (cw / 2), -1, 1);
      const viewportY = clamp((cy - (h / 2 + y - ch / 2)) / (ch / 2), -1, 1);
      const visible =
          +(opts.offset ? opts.offset <= cy :
                          (opts.threshold || 0) < visibleX * visibleY);

      obj.ctx = {
        elementHeight: h,
        elementWidth: w,
        intersectX: visibleX === 1 ? 0 : sign(x - cx),
        intersectY: visibleY === 1 ? 0 : sign(y - cy),
        offsetX: x,
        offsetY: y,
        viewportX,
        viewportY,
        visible,
        visibleX,
        visibleY
      };
    });
  };

  const render = () => {
    if (!elements) {
      return;
    }

    // Update root attributes if they have changed.
    const rootAttributes = {
      scrollDirX: rootCtx.scrollDirX,
      scrollDirY: rootCtx.scrollDirY
    };
    if (changeAndDetect(doc, '_SA', rootAttributes)) {
      setAttrs(doc, rootAttributes);
    }

    // Update props if the root context has changed.
    if (changeAndDetect(doc, '_S', rootCtx)) {
      props(doc, rootCtx);
    }

    const len = elements.length;
    for (let x = len - 1; x > -1; x--) {
      const obj = elements[x];
      const el = obj.$;
      const ctx = obj.ctx;
      const visible = ctx.visible;

      if (changeAndDetect(el, '_SO', ctx)) {
        // If percentage visibility has changed, update.
        props(el, ctx);
      }

      // Handle JavaScript callbacks.
      if (changeAndDetect(el, '_SV', visible)) {
        setAttrs(el, {scroll: visible ? 'in' : 'out'});
        ctx.index = x;
        onChange(el, ctx, doc);
        (visible ? onShown : onHidden)(el, ctx, doc);
      }

      // if this is shown multiple times, keep it in the list
      if (visible && opts.once) {
        elements.splice(x, 1);
      }
    }
  };

  const sub = subscribe(render);

  // Run initialize index.
  index();
  update();

  // Hook up document listeners to automatically detect changes.
  win[ON](RESIZE, update);
  container[ON](SCROLL, update);

  return {
    index,
    teardown() {
      sub();
      win[OFF](RESIZE, update);
      container[OFF](SCROLL, update);
    },
    update
  };
}
