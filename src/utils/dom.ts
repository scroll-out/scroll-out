import { enqueue } from "./enqueue";
import { hyphenate } from "./strings";
import { round } from "./math";
import { CSSPropOptions } from "../types";

export const win = window;
export const root = document.documentElement;

/** find elements */
export function $(e: Node | Node[] | NodeList | string, parent?: Element): HTMLElement[] {
    return !e || (e as NodeList).length == 0
        ? // null or empty string returns empty array
          []
        : (e as Node).nodeName
            ? // a single element is wrapped in an array
              [e]
            : // selector and NodeList are converted to Element[]
              [].slice.call(e[0].nodeName ? e : (parent || root).querySelectorAll(e as string));
}

export const setAttrs = enqueue((el, attrs) => {
    for (const key in attrs) {
        el.setAttribute("data-" + hyphenate(key), attrs[key]);
    }
});

export const setProps = (cssProps: true | CSSPropOptions) => {
    return enqueue((el, props) => {
        for (const key in props) {
            if (cssProps == true || cssProps[key]) {
                el.style.setProperty("--" + hyphenate(key), round(props[key]));
            }
        }
    });
};
