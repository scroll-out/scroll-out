declare global {
  interface Window {
    ScrollOut: ScrollOut;
  }
}

// tslint:disable-next-line:interface-name
export interface IScrollOutOptions {
  cssProps?: boolean | CSSPropOptions;
  offset?: number;
  onChange?: Function;
  onHidden?: Function;
  onShown?: Function;
  once?: false;
  scope?: Node | string;
  scrollingElement?: Node | string;
  targets?: Node | NodeList | Node[] | string;
  threshold?: number;
}

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

export interface ScrollOut {
  (options: IScrollOutOptions): ScrollOut;
}

export interface ScrollOut {
  index(): void;
  teardown(): void;
  update(): void;
}
