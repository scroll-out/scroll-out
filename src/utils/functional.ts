import { Monad } from "../types";

export function unwrap<T extends number|string>(value: Monad<T>) {
    return typeof value === 'function' ? value() : value;
}
export function noop() {}
