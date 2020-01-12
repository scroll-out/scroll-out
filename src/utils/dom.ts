import { CSSPropOptions } from '../types';
import { round } from './math';
import { hyphenate } from './strings';

/** find elements */
export function $(e: Node | Node[] | NodeList | string, parent?: Element): HTMLElement[] {
  return !e || (e as NodeList).length === 0
    ? // null or empty string returns empty array
      []
    : (e as Node).nodeName
    ? // a single element is wrapped in an array
      [e]
    : // selector and NodeList are converted to Element[]
      [].slice.call(e[0].nodeName ? e : (parent || document.documentElement).querySelectorAll(e as string));
}

export function setAttrs(el: Element, attrs: {}) {
  // tslint:disable-next-line:forin
  for (const key in attrs) {
    if (key.indexOf('_')) {
      el.setAttribute('data-' + hyphenate(key), attrs[key]);
    }
  }
}

export function setProps(cssProps: true | CSSPropOptions) {
  return (el: HTMLElement, props: {}) => {
    for (const key in props) {
      if (key.indexOf('_') && (cssProps === true || cssProps[key])) {
        el.style.setProperty('--' + hyphenate(key), (round(props[key]) as any) as string);
      }
    }
  };
}
