import { attachTests, assert, structureEquals } from "./testing.js"

/**
 * Two dimensional vector addition.
 * @param {{x: number, y: number}} param0 
 * @param {{x: number, y: number}} param1 
 * @returns {{x: number, y: number}}
 */
export const add = ({x: x1, y: y1}, {x: x2, y: y2}) =>
  ({x: x1 + x2, y: y1 + y2})

attachTests(add,
  function(verbose) {
    const v1 = {x: 2, y: 3}
    const v2 = {x: 10, y: -7}

    const actual = this(v1, v2)
    const expected = {x: 12, y: -4}

    const successful = structureEquals(actual, expected)

    return assert(this, successful, [v1, v2], actual, expected, verbose)
  }, 
  function(verbose) {
    const v1 = {x: -5, y: 6}
    const v2 = {x: -7, y: -4}

    const actual = this(v1, v2)
    const expected = {x: -12, y: 2}
    const successful = structureEquals(actual, expected)

    return assert(this, successful, [v1, v2], actual, expected, verbose)
  }
)

/**
 * Two dimensional vector subtraction.
 * @param {{x: number, y: number}} param0 
 * @param {{x: number, y: number}} param1 
 * @returns {{x: number, y: number}}
 */
export const sub = ({x: x1, y: y1}, {x: x2, y: y2}) =>
  ({x: x1 - x2, y: y1 - y2})

attachTests(sub,
  function(verbose) {
    const v1 = {x: 2, y: 3}
    const v2 = {x: 10, y: -7}

    const actual = this(v1, v2)
    const expected = {x: -8, y: 10}

    const successful = structureEquals(actual, expected)

    return assert(this, successful, [v1, v2], actual, expected, verbose)
  }, 
  function(verbose) {
    const v1 = {x: -5, y: 6}
    const v2 = {x: -7, y: -4}

    const actual = this(v1, v2)
    const expected = {x: 2, y: 10}
    const successful = structureEquals(actual, expected)

    return assert(this, successful, [v1, v2], actual, expected, verbose)
  }
)

/**
 * Curried two dimensional scalar multiplication with a vector.
 * @param {number} a a scalar
 * @returns {function({x: number, y: number}): {x: number, y: number}}
 */
export const scalarMult = a => ({x, y}) =>
  ({x: a * x, y: a * y})

attachTests(scalarMult,
  function(verbose) {
    const v = {x: 2, y: 3}
    const a = 6

    const actual = this(a)(v)
    const expected = {x: 12, y: 18}

    const successful = structureEquals(actual, expected)

    return assert(this, successful, [a, v], actual, expected, verbose)
  },
  function(verbose) {
    const v = {x: -1, y: 4}
    const a = -0.5

    const actual = this(a)(v)
    const expected = {x: 0.5, y: -2}

    const successful = structureEquals(actual, expected)

    return assert(this, successful, [a, v], actual, expected, verbose)
  }
)

/**
 * Two dimensional vector length.
 * @param {{x: number, y: number}} param0 
 * @returns {number}
 */
export const length = ({x, y}) =>
  Math.sqrt(x*x + y*y)

attachTests(length,
  function(verbose) {
    const v = {x: 4, y: 3}

    const actual = this(v)
    const expected = 5

    const successful = structureEquals(actual, expected)

    return assert(this, successful, [v], actual, expected, verbose)
  },
  function(verbose) {
    const v = {x: -2, y: 0}

    const actual = this(v)
    const expected = 2

    const successful = structureEquals(actual, expected)

    return assert(this, successful, [v], actual, expected, verbose)
  }
)

/**
 * Two dimensional vector norm.
 * @param {{x: number, y: number}} param0 
 * @returns {{x: number, y: number}} a vector facing in the same direction as the input vector but with length 1
 */
export const norm = ({x, y}) =>
  scalarMult(1 / length({x, y}))({x, y})

attachTests(norm,
  function(verbose) {
    const v = {x: 3, y: 0}

    const actual = this(v)
    const expected = {x: 1, y: 0}

    const successful = structureEquals(actual, expected)

    return assert(this, successful, [v], actual, expected, verbose)
  },
  function(verbose) {
    const v = {x: -1, y: -1}

    const actual = this(v)
    const expected = {x: -0.7071067811865475, y: -0.7071067811865475}

    const successful = structureEquals(actual, expected)

    return assert(this, successful, [v], actual, expected, verbose)
  }
)

/**
 * Curried counter-clockwise vector rotation.
 * @param {number} angle rotation angle in radians
 * @returns {function({x:number,y:number}): {x:number,y:number}}
 */
export const rotate = angle => ({x, y}) => ({
  x: Math.cos(angle) * x - Math.sin(angle) * y,
  y: Math.sin(angle) * x + Math.cos(angle) * y
})

attachTests(rotate, 
  function(verbose) {
    const v = {x: 1, y: 1}

    const actual = this(Math.PI/2)(v)
    const expected = {
      x: -0.9999999999999999, // -_-
      y: 1
    }

    const successful = structureEquals(actual, expected)

    return assert(this, successful, [v], actual, expected, verbose)
  }
)
