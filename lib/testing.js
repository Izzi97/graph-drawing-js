/**
 * Attach a test function to a testee function.
 * In the "test" function, *this* is bound to the "testee" function,
 * which allows accessing its inner fields.
 *
 * @param {Function} testee the function to be tested
 * @param {((verbose: boolean) => boolean)[]} tests the functions that carry out the tests, must be defined with "function" syntax
 * @returns {void}
 */
export const attachTests = (testee, ...tests) => {
  testee.test = verbose => 
    tests.reduce((allGood, test) =>
      allGood && test.bind(testee)(verbose)
      , true
    )
}

/**
 * Determine the *structural* equality of two *plain JS values*.
 * @param {undefined|boolean|number|bigint|string|symbol|function|object} a plain value a
 * @param {undefined|boolean|number|bigint|string|symbol|function|object} b plain value b
 * @returns {boolean}
 */
export const structureEquals = (a, b) => {
  const equalSizeArrays = () =>
    Array.isArray(a) && Array.isArray(b) && a.length === b.length

  const arrayEquals = () =>
    a.reduce((acc, _, index) =>
      acc && structureEquals(a[index], b[index])
      , true
    )
  
  const equalSizeObjects = () =>
    Object.getPrototypeOf(a).constructor === Object && 
    Object.getPrototypeOf(b).constructor === Object &&
    Object.entries(a).length === Object.entries(b).length
  
  const objectEquals = () =>
    Object.keys(a).reduce((acc, key) => 
      acc && structureEquals(a[key], b[key])
      , true
    )

  switch(typeof(a)) {
    case "undefined":
    case "boolean":
    case "number":
    case "bigint":
    case "string":
    case "symbol":
    case "function":
      return a === b
    
    case "object":
      if (a === null)
        return a === b
      else if (equalSizeArrays())
        return arrayEquals()
      else if (equalSizeObjects())
        return objectEquals()
      else
        return false
    
    default:
      return false
  }
}

/**
 * Assert a function's test success by analyzing its test proposition and logging the result, 
 * @param {Function} func the function object that has been tested
 * @param {boolean} successful indicates the success of the test run
 * @param {any[]} args the arguments passed to the function during the test run
 * @param {any} actual the actual output produced by the function during the test run
 * @param {any} expected the expected output the function should have produced
 * @param {boolean} verbose indicates if successful test runs should also be logged, defaults to true
 * @returns {boolean} the succes of the test run for library use
 */
export const assert = (func, successful, args, actual, expected, verbose = true) => {
  if (!successful) {
    console.error([
      `FAILED TEST for "${func.name}"`,
      "",
      "for arguments",
      JSON.stringify(args, null, 2),
      "",
      "and got",
      JSON.stringify(actual, null, 2),
      "",
      "but expected",
      JSON.stringify(expected, null, 2)
    ].join("\n"))
  }
  else if (verbose) {
    console.log([
      `PASSED TEST for "${func.name}"`,
      "",
      "for arguments",
      JSON.stringify(args, null, 2),
      "",
      "with result",
      JSON.stringify(actual, null, 2)
    ].join("\n"))
  }

  return Boolean(successful)
}

/**
 * Dynamically load, iterate and run all *defined* tests on a module's exports from its source locator.
 * @param {string} source the source locator (typically a relative path) of the module to be tested
 * @param {boolean} verbose indicates if test parameters, results and warnings for non-specified tests should be logged, defaults to true
 * @returns {Promise<boolean>} the accumulated success of all *defined* tests, and only of these
 */
export const testModule = async (source, verbose) =>
  import(source)
    .then(module => {
      verbose && console.info(`RUNNING TESTS for "${source}"`)

      return Object.entries(module)
        .reduce((allGood, [name, exportedMember]) => {
          const test = exportedMember?.test && typeof(exportedMember.test) === "function"
            ? exportedMember.test
            : false
          
          return  (test ?
            exportedMember.test(verbose) :
            (verbose && console.warn(`no test defined for exported member "${name}" of module "${source}"`)
            , true)
          ) && allGood
        }, true)
    })
  .catch(error => {
    console.error(error)
    return false
  })

/**
 * Aysnchronously test all relevant modules in this package (currently only 'vector-math.js').
 * @param {boolean} verbose 
 * @returns {Promise<boolean>}
 */
export const runTests = async (verbose = false) =>
  testModule("./vector-math.js", verbose)
