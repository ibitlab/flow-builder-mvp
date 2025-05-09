import { Canvas, Rect, FabricText, Line, Triangle, Group } from "fabric";

const canvasEl = document.getElementById("canvasFlow");

const canvas = new Canvas(canvasEl, {
  backgroundColor: "#f0f0f0",
  width: 800,
  height: 500,
});

const connections = [];

function connectNodes(from, to) {
  const line = new Line(
    [from.left + 60, from.top + 30, to.left + 60, to.top + 30],
    {
      stroke: "black",
      strokeWidth: 2,
      selectable: false,
    },
  );

  // Calculate arrowhead position and rotation
  const angle =
    Math.atan2(to.top - from.top, to.left - from.left) * (180 / Math.PI);

  const arrow = new Triangle({
    left: to.left + 60,
    top: to.top + 30,
    width: 12,
    height: 16,
    fill: "black",
    angle: angle + 90, // Adjust to align with the line direction
    originX: "center",
    originY: "center",
  });

  canvas.add(line, arrow);
  connections.push({ from, to, line, arrow });
}

canvas.on("object:moving", function (event) {
  console.log("Item movement");
  const movedObject = event.target;
  updateConnections(movedObject);
});

function updateConnections(movedObject) {
  connections.forEach((conn) => {
    if (conn.from === movedObject || conn.to === movedObject) {
      conn.line.set({
        x1: conn.from.left + 60,
        y1: conn.from.top + 30,
        x2: conn.to.left + 60,
        y2: conn.to.top + 30,
      });
      conn.line.setCoords();

      // Update arrow position
      conn.arrow.set({
        left: conn.to.left + 60,
        top: conn.to.top + 30,
        angle:
          Math.atan2(
            conn.to.top - conn.from.top,
            conn.to.left - conn.from.left,
          ) *
            (180 / Math.PI) +
          90,
      });
      conn.arrow.setCoords();
    }
  });
  canvas.renderAll();
}

// Function to create a flowchart node
function createNode(text, left, top) {
  const rect = new Rect({
    width: 120,
    height: 60,
    fill: "lightblue",
    stroke: "black",
    strokeWidth: 2,
    rx: 10, // Rounded corners
    ry: 10,
  });

  const label = new FabricText(text, {
    fontSize: 16,
    fill: "black",
    originX: "center",
    originY: "center",
  });

  const group = new Group([rect, label], {
    left,
    top,
    selectable: true,
    lockScalingX: true,
    lockScalingY: true,
    lockRotation: true,
    hasControls: false,
  });

  canvas.add(group);
  return group;
}
// Create nodes and establish connections
const startNode = createNode("Start", 100, 100);
const processNode = createNode("Process", 300, 100);
const endNode = createNode("End", 500, 100);

connectNodes(startNode, processNode);
connectNodes(processNode, endNode);
