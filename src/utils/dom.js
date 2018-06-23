import { enqueue } from './enqueue';

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

export var setAttr = enqueue(function(el, name, value) {
  el.setAttribute("data-" + name, value);
});

export var setProp = enqueue(function(el, name, value) {
  el.style.setProperty("--" + name, value);
});