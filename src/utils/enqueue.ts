import { noop } from "./noop";

/**
 * Defers execution and handles all calls to this function in a frame all at once.
 * This is used to prevent ping-pong read/writes to the browser while still maintaining
 * code that looks like setAttribute and setProperty are being called in place.
 */
export function enqueue<T extends Function>(fn: T): T {
  if (fn) {
    var id, queue;

    var clearQueue = function() {
      id = 0;
      queue.some(function(q) {
        fn.apply(0, q);
      });
    };

    return (function() {
      if (!id) {
        queue = [];
        id = requestAnimationFrame(clearQueue);
      }
      queue.push(arguments);
    } as any) as T;
  }
  return (noop as any) as T;
}
