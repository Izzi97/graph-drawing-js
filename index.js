import { runTests } from "./lib/testing.js"
import { getEdges, runLayout } from "./lib/graph.js"
import { initCanvas } from "./lib/canvas.js"

if (! await runTests())
  throw ""

const adjacencyList = [
  [],
  [0,2],
  [3,4,5],
  [6],
  [],
  [],
  [7,8],
  [],
  [9,10],
  [],
  []
]

const edges = getEdges(adjacencyList)

const { drawVertex, drawEdge, clear } = initCanvas()

for (const positions of runLayout(adjacencyList)) {
  clear()

  positions.forEach(drawVertex)

  edges
    .map(({from, to}) => [positions[from], positions[to]])
    .forEach(neighbors => drawEdge(...neighbors))

  await new Promise(r => setTimeout(r, 16));
}

alert("finished")
