import { enqueue } from "./enqueue";
import { hyphenate } from "./strings";
import { round } from "./math";

export var win = window;
export var root = document.documentElement;

/** find elements */
export function $(
  e: Node | Node[] | NodeList | string,
  parent?: Element
): HTMLElement[] {
  return !e || (e as NodeList).length == 0
    ? // null or empty string returns empty array
      []
    : (e as Node).nodeName
      ? // a single element is wrapped in an array
        [e]
      : // selector and NodeList are converted to Element[]
        [].slice.call(
          e[0].nodeName ? e : (parent || root).querySelectorAll(e as string)
        );
}

export var setAttrs = enqueue(function(el, attrs) {
  for (var key in attrs) {
    el.setAttribute("data-" + hyphenate(key), attrs[key]);
  }
});

export var setProps = enqueue(function(el, props) {
  for (var key in props) {
    el.style.setProperty("--" + hyphenate(key), round(props[key]));
  }
});
