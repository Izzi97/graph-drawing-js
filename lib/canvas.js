import * as V from "./vector-math.js"

const canvas = document.querySelector("canvas")
canvas.width = document.body.clientWidth
canvas.height = document.body.clientHeight

const context = canvas.getContext("2d")
context.translate(canvas.width / 2, canvas.height / 2)
context.scale(1, -1)

export const initCanvas = (vertexRadius = 5) => {
  const drawVertex = ({x, y}) => {
    context.beginPath()
    context.arc(x, y, vertexRadius, 0, 2 * Math.PI)
    context.fill()
  }

  const drawEdge = ({x: x1, y: y1}, {x: x2, y: y2}) => {
    context.beginPath()
    context.moveTo(x1, y1)
    context.lineTo(x2, y2)
    context.stroke()

    const tip = { x: x2, y: y2 }
    const tail = { x: x1, y: y1 }

    const tipToHead = V.scalarMult(vertexRadius)(V.norm(V.sub(tail, tip)))
    const headPoint = V.add(tip, tipToHead)
    const headBase = V.add(headPoint, tipToHead)
    const headRight = V.add(headBase, V.scalarMult(1/2)(V.rotate(Math.PI/2)(tipToHead)))
    const headLeft = V.add(headBase, V.scalarMult(1/2)(V.rotate(-Math.PI/2)(tipToHead)))
    
    context.beginPath()
    context.moveTo(headPoint.x, headPoint.y)
    context.lineTo(headLeft.x, headLeft.y)
    context.lineTo(headRight.x, headRight.y)
    context.closePath()
    context.stroke()
    context.fill()
  }

  const clear = () => context.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height)

  return { drawVertex, drawEdge, clear }
}
