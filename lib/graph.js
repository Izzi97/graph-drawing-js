import * as V from "./vector-math.js"

/**
 * Construct the list of vertices from an adjacency-list.
 * @param {number[][]} adjacencyList 
 * @returns {number[]}
 */
const getVertices = adjacencyList =>
  adjacencyList.map((_, vertex) => vertex)

/**
 * Construct the list of edges form an adjacency-list.
 * @param {number[][]} adjacencyList 
 * @returns {{from: number, to: number}[]}
 */
export const getEdges = adjacencyList =>
  adjacencyList
    .flatMap((row, from) =>
      row
        .map(to => ({
          from,
          to
        }))
    )

/**
 * Construct the list of adjacent vertices to a given vertex within an adjacency-list.
 * @param {number[][]} adjacencyList
 * @returns {function(number): number[]}
 */
const getAdjacentVertices = adjacencyList => vertex => {
  const outbound = adjacencyList[vertex] || []

  const inbound = adjacencyList.flatMap((vertices, from) =>
    vertices.includes(vertex) ?
      [from] :
      []
  )

  return outbound.concat(inbound)
}

/**
 * Calculate spring force between two adjacent vertices u and v.
 * @param {{x: number, y: number}} u vertex u
 * @param {{x: number, y: number}} v vertex v
 * @param {number} optimumDistance the optimum length of the spring between u and v in resting position
 * @returns {{x: number, y: number}} the resulting force vector on u
 */
const calculateSpringForce = (u, v, optimumDistance) => {
  const uToV = V.sub(v, u)
  const magnitude = optimumDistance * Math.log(V.length(uToV) / optimumDistance)
  return V.scalarMult(magnitude)(V.norm(uToV))
}

/**
 * Calculate the electrostatic repulsion force between two vertices u and v.
 * @param {{x: number, y: number}} u vertex u
 * @param {{x: number, y: number}} v vertex v
 * @param {number} optimumDistance and optimum distance factor to scale the repulsion force against spring forces
 * @returns {{x: number, y: number}} the resulting force vector on u
 */
const calculateRepulsion = (u, v, optimumDistance) => {
  const uToV = V.sub(u, v)
  const magnitude = optimumDistance / V.length(uToV)
  return V.scalarMult(magnitude)(V.norm(uToV))
}

/**
 * Curried creation of a spring-embedder graph-layouting step-function depending on a global adjacency-list of the graph and a global optimum distance for force distribution.
 * @param {number[][]} adjacencyList the adjacency-list representation of a directed graph mapping vertex indices to adjacent vertex indices
 * @param {number} optimumDistance the optimum distance of two vertices in the resulting layout
 * @returns {function({x: number, y: number}[]): {x: number, y: number}[]} the actual layouting function that applies one step of the force-based layouting algorithm to a mapping of vertex positions
 */
const makeLayout = (adjacencyList, optimumDistance) => (positions) => {
  const damping = 0.4
  const vertices = getVertices(adjacencyList)

  return vertices.map(vertex => {
    const adjacentVertices = getAdjacentVertices(adjacencyList)(vertex)

    const localAttraction = adjacentVertices
      .reduce((acc, adjacent) => {
        const pos1 = positions[vertex]
        const pos2 = positions[adjacent]
        const attraction = calculateSpringForce(pos1, pos2, optimumDistance)
        return V.add(acc, attraction)
      }, {x: 0, y: 0})

    const globalRepulsion = vertices
      .filter(current => current !== vertex)
      .reduce((acc, global) => {
        const pos1 = positions[vertex]
        const pos2 = positions[global]
        const repulsion = calculateRepulsion(pos1, pos2, optimumDistance)
        return V.add(acc, repulsion)
      }, {x: 0, y: 0})

    const force = V.scalarMult(damping)(V.add(localAttraction, globalRepulsion))

    return V.add(force, positions[vertex])
  })
}

/**
 * Run a spring-embedder graph-layouting algorithm on a graph represented as adjacency list with a fixed optimum vertex distance for a desired number of iterations as generator-function.
 * @param {number[][]} adjacencyList the adjacency-list representation of a directed graph mapping vertex indices to adjacent vertex indices
 * @param {number} vertexDistance the optimum distance of two vertices in the resulting layout
 * @param {number} iterations the number of iteration steps the layouting simulation is run
 * @returns {{x: number, y: number}[]} yield returns a 2D layout of the input graph from this generator function, suitable for input to subsequent animation/rendering 
 */
export const runLayout = function*(adjacencyList, vertexDistance = 100, iterations = 1000) {
  const vertices = getVertices(adjacencyList)
  const layout = makeLayout(adjacencyList, vertexDistance)

  let positions = vertices.map(() => 
    ({
      x: (Math.random() - 0.5) * 2 * vertexDistance,
      y: (Math.random() - 0.5) * 2 * vertexDistance
    })
  )
  yield positions

  for (let i = 0; i < iterations; i++) {
    positions = layout(positions)
    yield positions
  }
}
