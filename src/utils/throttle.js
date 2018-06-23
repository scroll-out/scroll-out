export function throttle(fn) {
    var time = Date.now();
    return function() {
        if (time + 17 - Date.now() < 0) {
            time = Date.now()
            fn()
        }
    };
}