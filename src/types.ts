declare global {
  interface Window {
    ScrollOut: ScrollOut;
  }
}

// tslint:disable-next-line:interface-name
export interface IScrollOutOptions {
  cssProps?: boolean | CSSPropOptions;
  offset?: ValueOrProvider<number>;
  onChange?: TargetEventCallback;
  onHidden?: TargetEventCallback;
  onShown?: TargetEventCallback;
  onScroll?: (el: HTMLElement, scrollingElementCtx: ScrollingElementContext, ctx: ElementContext[]) => void;
  once?: false;
  scope?: Node | string;
  scrollingElement?: Node | string;
  targets?: Node | NodeList | Node[] | string;
  threshold?: ValueOrProvider<number>;
}

export type TargetEventCallback = (el: HTMLElement, ctx: ElementContext, doc: HTMLElement) => void;
export type ValueProvider<T> = (el: HTMLElement, ctx: ElementContext, doc: HTMLElement) => T;
export type ValueOrProvider<T extends string | number> = T | (ValueProvider<T>);

export interface CSSPropOptions {
  elementHeight?: boolean;
  elementWidth?: boolean;
  intersectX?: boolean;
  intersectY?: boolean;
  offsetX?: boolean;
  offsetY?: boolean;
  visible?: boolean;
  visibleX?: boolean;
  visibleY?: boolean;
}

export interface ElementContext {
  element: HTMLElement;
  elementHeight: number;
  elementWidth: number;
  index: number;
  intersectX: -1 | 0 | 1;
  intersectY: -1 | 0 | 1;
  offsetX: number;
  offsetY: number;
  viewportX: number;
  viewportY: number;
  visible: 0 | 1;
  visibleX: number;
  visibleY: number;
}

export interface ElementContextInternal extends ElementContext {
  _changed: boolean;
  _visibleChanged: boolean;
}

export interface ScrollingElementContext {
  scrollDirX: number;
  scrollDirY: number;
  scrollPercentX: number;
  scrollPercentY: number;
}

export interface ScrollingElementContextInternal extends ScrollingElementContext {
  __changed__: boolean;
}

export interface ScrollOut {
  (options: IScrollOutOptions): ScrollOut;
}

export interface ScrollOut {
  index(): void;
  teardown(): void;
  update(): void;
}
