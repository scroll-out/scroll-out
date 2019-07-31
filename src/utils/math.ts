export function clamp(v: number, min: number, max: number) {
  return min > v ? min : max < v ? max : v;
}

export function sign(x: number): -1 | 1 {
  return (+(x > 0) - +(x < 0)) as -1 | 1;
}

export function round(n: number) {
  return Math.round(n * 10000) / 10000;
}
