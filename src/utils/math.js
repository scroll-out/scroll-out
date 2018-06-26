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
 *
 * @param {number} p0
 * @param {number} s0
 * @param {number} p1
 * @param {number} s1
 */
export function getRatio(p0, s0, p1, s1) {
    return (clamp(p0 + s0, p1, p1 + s1) - clamp(p0, p1, p1 + s1)) / s0;
}

/**
 * @param {number} x
 */
export function sign(x) {
    return (x > 0) - (x < 0);
}
