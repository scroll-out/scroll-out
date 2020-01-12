let clearTask: number | undefined;
let subscribers = [];

function loop() {
  // process subscribers
  const s = subscribers.slice();
  s.forEach(s2 => s2());

  // schedule next loop if the queue needs it
  clearTask = subscribers.length ? requestAnimationFrame(loop) : 0;
}

export function subscribe(fn: () => void) {
  subscribers.push(fn);
  if (!clearTask) {
    loop();
  }
  return () => {
    subscribers = subscribers.filter(s => s !== fn);
    if (!subscribers.length && clearTask) {
      clearTask = 0;
      cancelAnimationFrame(clearTask);
    }
  };
}