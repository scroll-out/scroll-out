/**
 *
 * @param {number} v
 * @param {number} min
 * @param {number} max
 */
export function clamp(v, min, max) {
    return min > v ? min : max < v ? max : v;
}

/**
 * @param {number} x
 */
export function sign(x) {
    return (x > 0) - (x < 0);
}

/**
 * @param {number} n
 */
export function round(n) {
    return Math.round(n * 10000) / 10000;
}
