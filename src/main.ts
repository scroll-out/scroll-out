import { enqueue, subscribe } from './utils/enqueue';
import { sign, clamp } from './utils/math';
import { $, setAttrs, setProps, win, root } from './utils/dom';
import { noop } from './utils/noop';
import { IScrollOutOptions } from './types';

const SCROLL = 'scroll';
const RESIZE = 'resize';
const ON = 'addEventListener';
const OFF = 'removeEventListener';
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

	let rootCtx: Record<string, number>;
	let elements: { $: HTMLElement; ctx: Record<string, any> }[];
	let shouldIndex: boolean;
	const index = () => {
		shouldIndex = true;
	};

	let cx: number, cy: number;
	const update = () => {
		// calculate position, direction and ratio
		const cw = doc.clientWidth;
		const ch = doc.clientHeight;
		const dirX = sign(-cx + (cx = doc.scrollLeft || win.pageXOffset));
		const dirY = sign(-cy + (cy = doc.scrollTop || win.pageYOffset));
		const scrollPercentX = doc.scrollLeft / (doc.scrollWidth - cw || 1);
		const scrollPercentY = doc.scrollTop / (doc.scrollHeight - ch || 1);

		// call update to dom
		rootCtx = {
			scrollDirX: dirX,
			scrollDirY: dirY,
			scrollPercentX: scrollPercentX,
			scrollPercentY: scrollPercentY
		};

		if (shouldIndex) {
			shouldIndex = false;
			elements = $(opts.targets || '[data-scroll]', $(opts.scope || doc)[0]).map((el) => {
				return {
					$: el,
					ctx: {}
				};
			});
		}

		elements.forEach((obj) => {
			const el = obj.$;
			// get element dimensions
			const x = el.offsetLeft;
			const y = el.offsetTop;
			const w = el.clientWidth;
			const h = el.clientHeight;

			// find visible ratios for each element
			const visibleX = (clamp(x + w, cx, cx + cw) - clamp(x, cx, cx + cw)) / w;
			const visibleY = (clamp(y + h, cy, cy + ch) - clamp(y, cy, cy + ch)) / h;
			var viewportX = clamp((cx - (w / 2 + x - cw / 2)) / (cw / 2), -1, 1);
			var viewportY = clamp((cy - (h / 2 + y - ch / 2)) / (ch / 2), -1, 1);

			obj.ctx = {
				elementHeight: h,
				elementWidth: w,
				intersectX: visibleX == 1 ? 0 : sign(x - cx),
				intersectY: visibleY == 1 ? 0 : sign(y - cy),
				offsetX: x,
				offsetY: y,
				viewportX: viewportX,
				viewportY: viewportY,
				visibleX: visibleX,
				visibleY: visibleY,
				visible: +(opts.offset ? opts.offset <= cy : (opts.threshold || 0) < visibleX * visibleY)
			};
		});
	};

	const render = function() {
		if (!elements) {
			return;
		}

		if (changeAndDetect(doc, '_S', rootCtx)) {
			setAttrs(doc, {
				scrollDirX: rootCtx.scrollDirX,
				scrollDirY: rootCtx.scrollDirY
			});
			props(doc, rootCtx);
		}
		const len = elements.length;
		for (let x = len - 1; x > -1; x--) {
			const obj = elements[x];
			const el = obj.$;
			const ctx = obj.ctx;
			const visible = ctx.visible;

			if (changeAndDetect(el, '_SO', ctx)) {
				// if percentage visibility has changed, update
				props(el, ctx);
			}

			// handle callbacks
			if (changeAndDetect(el, '_SV', visible)) {
				setAttrs(el, {
					scroll: visible ? 'in' : 'out'
				});

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

	// run initialize index
	index();
	update();

	// hook up document listeners to automatically detect changes
	win[ON](RESIZE, index);
	container[ON](SCROLL, update);

	return {
		index: index,
		update: update,
		teardown() {
			sub();
			win[OFF](RESIZE, index);
			container[OFF](SCROLL, update);
		}
	};
}
