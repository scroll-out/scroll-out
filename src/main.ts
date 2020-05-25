import {
  IScrollOutOptions,
  ElementContextInternal,
  ScrollingElementContextInternal
} from './types';
import { $, setAttrs, setProps } from './utils/dom';
import { subscribe } from './utils/loop';
import { clamp, sign } from './utils/math';
import { noop, unwrap } from './utils/functional';

/**
 * Creates a new instance of ScrollOut that marks elements in the viewport with
 * an "in" class and marks elements outside of the viewport with an "out"
 */
// tslint:disable-next-line:no-default-export
export default function (opts: IScrollOutOptions) {
  // Apply default options.
  opts = opts || {};

  // Debounce onChange/onHidden/onShown.
  const onChange = opts.onChange || noop;
  const onHidden = opts.onHidden || noop;
  const onShown = opts.onShown || noop;
  const onScroll = opts.onScroll || noop;
  const props = opts.cssProps ? setProps(opts.cssProps) : noop;

  const se = opts.scrollingElement;
  const container = se ? $(se)[0] : window;
  const doc = se ? $(se)[0] : document.documentElement;

  let rootChanged = false;
  const scrollingElementContext = {} as ScrollingElementContextInternal;
  let elementContextList: ElementContextInternal[] = [];
  let clientOffsetX: number, clientOffsety: number;
  let sub: (() => void) | undefined

  function index() {
    elementContextList = $(opts.targets || '[data-scroll]', $(opts.scope || doc)[0]).map(
      el => (({ element: el } as any) as ElementContextInternal)
    );
  }

  function update() {
    // Calculate position, direction and ratio.
    const clientWidth = doc.clientWidth;
    const clientHeight = doc.clientHeight;
    const scrollDirX = sign(-clientOffsetX + (clientOffsetX = doc.scrollLeft || window.pageXOffset));
    const scrollDirY = sign(-clientOffsety + (clientOffsety = doc.scrollTop || window.pageYOffset));
    const scrollPercentX = doc.scrollLeft / (doc.scrollWidth - clientWidth || 1);
    const scrollPercentY = doc.scrollTop / (doc.scrollHeight - clientHeight || 1);

    // Detect if the root context has changed.
    rootChanged =
      rootChanged ||
      scrollingElementContext.scrollDirX !== scrollDirX ||
      scrollingElementContext.scrollDirY !== scrollDirY ||
      scrollingElementContext.scrollPercentX !== scrollPercentX ||
      scrollingElementContext.scrollPercentY !== scrollPercentY;
    scrollingElementContext.scrollDirX = scrollDirX;
    scrollingElementContext.scrollDirY = scrollDirY;
    scrollingElementContext.scrollPercentX = scrollPercentX;
    scrollingElementContext.scrollPercentY = scrollPercentY;

    let childChanged = false;
    for (let index = 0; index < elementContextList.length; index++) {
      const ctx = elementContextList[index];
      const element = ctx.element;
      // find the distance from the element to the scrolling container
      let target = element;
      let offsetX = 0;
      let offsetY = 0;
      do {
        offsetX += target.offsetLeft;
        offsetY += target.offsetTop;
        target = target.offsetParent as HTMLElement;
      } while (target && target !== container);

      // Get element dimensions.
      const elementHeight = element.clientHeight || element.offsetHeight || 0;
      const elementWidth = element.clientWidth || element.offsetWidth || 0;

      // Find visible ratios for each element.
      const visibleX =
        (clamp(offsetX + elementWidth, clientOffsetX, clientOffsetX + clientWidth) -
          clamp(offsetX, clientOffsetX, clientOffsetX + clientWidth)) /
        elementWidth;
      const visibleY =
        (clamp(offsetY + elementHeight, clientOffsety, clientOffsety + clientHeight) -
          clamp(offsetY, clientOffsety, clientOffsety + clientHeight)) /
        elementHeight;
      const intersectX = visibleX === 1 ? 0 : sign(offsetX - clientOffsetX);
      const intersectY = visibleY === 1 ? 0 : sign(offsetY - clientOffsety);
      const viewportX = clamp(
        (clientOffsetX - (elementWidth / 2 + offsetX - clientWidth / 2)) / (clientWidth / 2),
        -1,
        1
      );
      const viewportY = clamp(
        (clientOffsety - (elementHeight / 2 + offsetY - clientHeight / 2)) / (clientHeight / 2),
        -1,
        1
      );

      let visible: 0 | 1;
      if (opts.offset) {
        visible = unwrap(opts.offset, element, ctx, doc) <= clientOffsety ? 1 : 0;
      } else if ((unwrap(opts.threshold, element, ctx, doc) || 0) < visibleX * visibleY) {
        visible = 1;
      } else {
        visible = 0;
      }

      const changedVisible = ctx.visible !== visible;
      const changed =
        ctx._changed ||
        changedVisible ||
        ctx.visibleX !== visibleX ||
        ctx.visibleY !== visibleY ||
        ctx.index !== index ||
        ctx.elementHeight !== elementHeight ||
        ctx.elementWidth !== elementWidth ||
        ctx.offsetX !== offsetX ||
        ctx.offsetY !== offsetY ||
        ctx.intersectX !== ctx.intersectX ||
        ctx.intersectY !== ctx.intersectY ||
        ctx.viewportX !== viewportX ||
        ctx.viewportY !== viewportY;

      if (changed) {
        childChanged = true;
        ctx._changed = true;
        ctx._visibleChanged = changedVisible;
        ctx.visible = visible;
        ctx.elementHeight = elementHeight;
        ctx.elementWidth = elementWidth;
        ctx.index = index;
        ctx.offsetX = offsetX;
        ctx.offsetY = offsetY;
        ctx.visibleX = visibleX;
        ctx.visibleY = visibleY;
        ctx.intersectX = intersectX;
        ctx.intersectY = intersectY;
        ctx.viewportX = viewportX;
        ctx.viewportY = viewportY;
        ctx.visible = visible;
      }
    }

    if (!sub && (rootChanged || childChanged)) {
      sub = subscribe(render);
    }
  }

  function render() {
    maybeUnsubscribe();

    // Update root attributes if they have changed.
    if (rootChanged) {
      rootChanged = false;
      setAttrs(doc, {
        scrollDirX: scrollingElementContext.scrollDirX,
        scrollDirY: scrollingElementContext.scrollDirY
      });
      props(doc, scrollingElementContext);
      onScroll(doc, scrollingElementContext, elementContextList);
    }

    const len = elementContextList.length;
    for (let x = len - 1; x > -1; x--) {
      const ctx = elementContextList[x];
      const el = ctx.element;
      const visible = ctx.visible;

      if (ctx._changed) {
        ctx._changed = false;
        props(el, ctx);
      }
      if (ctx._visibleChanged) {
        setAttrs(el, { scroll: visible ? 'in' : 'out' });
        onChange(el, ctx, doc);
        (visible ? onShown : onHidden)(el, ctx, doc);
      }

      // if this is shown multiple times, keep it in the list
      if (visible && opts.once) {
        elementContextList.splice(x, 1);
      }
    }
  }

  function maybeUnsubscribe() {
    if (sub) {
      sub();
      sub = undefined;
    }
  }

  // Run initialize index.
  index();
  update();
  render();

  // Collapses sequential updates into a single update.
  let updateTaskId = 0;
  const onUpdate = () => {
    updateTaskId = updateTaskId || setTimeout(() => {
      updateTaskId = 0;
      update();
    }, 0) as unknown as number;
  };

  // Hook up document listeners to automatically detect changes.
  window.addEventListener('resize', onUpdate);
  container.addEventListener('scroll', onUpdate);

  return {
    index,
    update,
    teardown() {
      maybeUnsubscribe();
      window.removeEventListener('resize', onUpdate);
      container.removeEventListener('scroll', onUpdate);
    }
  };
}
