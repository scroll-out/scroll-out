let clearTask: number | undefined;
let subscribers = [];

function loop() {
  clearTask = 0;
  subscribers.slice().forEach(s2 => s2());
  enqueue();
}

function enqueue() {
  if (!clearTask && subscribers.length) {
    clearTask = requestAnimationFrame(loop);
  }
}

export function subscribe(fn: () => void): () => void {
  subscribers.push(fn);
  enqueue();
  return () => {
    subscribers = subscribers.filter(s => s !== fn);
    if (!subscribers.length && clearTask) {
      cancelAnimationFrame(clearTask);
      clearTask = 0;
    }
  };
}