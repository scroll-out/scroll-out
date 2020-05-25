import { ValueOrProvider, ElementContext } from "../types";

export function unwrap<T extends number | string>(value: ValueOrProvider<T>, el: HTMLElement, ctx: ElementContext, doc: HTMLElement) {
    return typeof value === 'function' ? value(el, ctx, doc) : value;
}
export function noop() { }
