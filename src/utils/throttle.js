export function throttle(fn) {
    var lastId;
    var time = Date.now();
    return function() {
        if (time + 17 - Date.now() < 0) {
            lastId = 0;
            time = Date.now();
            fn();
        } else {
            // ensure that if there is a skipped action, that it will fire
            // if the timeout occurs and no other actions occur
            lastId = lastId || setTimeout(fn, 17);
        }
    };
}
