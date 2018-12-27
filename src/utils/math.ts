export function clamp(v: number, min: number, max: number) {
  return min > v ? min : max < v ? max : v;
}

export function sign(x: number) {
  return +(x > 0) - +(x < 0);
}

export function round(n: number) {
  return Math.round(n * 10000) / 10000;
}
