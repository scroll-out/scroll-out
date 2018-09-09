declare global {
  interface Window {
    ScrollOut: ScrollOut;
  }
}

export interface IScrollOutOptions {
  scope?: Node | string;
  scrollingElement?: Node | string;
  targets?: Node | NodeList | Node[] | string;
  once?: false;
  offset?: number;
  threshold?: number;
  cssProps?: boolean | CSSPropOptions;
  onChange?: Function;
  onHidden?: Function;
  onShown?: Function;
}

export interface CSSPropOptions {
  visibleX?: boolean;
  visibleY?: boolean;
  visible?: boolean;
  offsetX?: boolean;
  offsetY?: boolean;
  elementWidth?: boolean;
  elementHeight?: boolean;
  intersectX?: boolean;
  intersectY?: boolean;
}

export interface ScrollOut {
  (options: IScrollOutOptions): ScrollOut;
}

export interface ScrollOut {
  index(): void;
  update(): void;
  teardown(): void;
}
