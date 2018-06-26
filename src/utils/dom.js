import { enqueue } from './enqueue';
import { hyphenate } from './strings';

export var win = window;
export var root = document.documentElement; 

/**
 * find elements
 * @param {Node | Node[] | NodeList | string} e
 * @param {Node} param
 * @returns {HTMLElement[]}
 */
export function $(e, parent) {
    return !e || e.length == 0
        ? // null or empty string returns empty array
          []
        : e.nodeName
            ? // a single element is wrapped in an array
              [e]
            : // selector and NodeList are converted to Element[]
              [].slice.call(e[0].nodeName ? e : (parent || root).querySelectorAll(e));
}

export var setAttrs = enqueue(function(el, attrs) {
  for (var key in attrs) {
    el.setAttribute("data-" + hyphenate(key), attrs[key]);
  }
});

export var setProps = enqueue(function(el, props) {
  for (var key in props) {
    el.style.setProperty("--" + hyphenate(key), props[key]);
  }
});