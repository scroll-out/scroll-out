import { noop } from "./noop";

let clearTask;
let actions = [];
let subscribers = [];

export function subscribe(fn) {
    subscribers.push(fn);
    clearTask || loop();
    return function() {
        subscribers = subscribers.filter(s => s != fn);
        if (!subscribers.length && clearTask) {
            cancelAnimationFrame(clearTask);
        }
    };
}

function loop() {
    // process subscribers
    let s = subscribers.slice();
    s.forEach(s2 => s2());

    // process actions collected
    const next = actions;
    actions = [];
    next.forEach(q => q.f.apply(0, q.a));

    // schedule next loop if the queue needs it
    clearTask = subscribers.length ? requestAnimationFrame(loop) : 0;
}

export function enqueue<T extends Function>(fn: T): T {
    fn = fn || ((noop as any) as T);
    return (function() {
        fn.apply(0, arguments);
    } as any) as T;
}
