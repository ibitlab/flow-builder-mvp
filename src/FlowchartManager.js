import { Canvas, Rect, FabricText, Line, Triangle, Group } from "fabric";

const chartDefaultConfig = {
  selection: true,
  subTargetCheck: true,
  backgroundColor: "#f0f0f0",
  width: 800,
  height: 500,
};

export class FlowchartManager {
  constructor(canvasId, config = {}) {
    // Initialize Fabric canvas using a config object to centralize settings.
    this.canvas = new Canvas(
      canvasId,
      Object.assign(chartDefaultConfig, config),
    );

    console.log("this.canvas=", this.canvas);

    // State arrays.
    this.nodes = [];
    this.connections = [];

    // Variables for interactive connections.
    this.currentLine = null;
    this.connectionStartCircle = null;
    this.currentTargetBluePoints = [];
    this.animationFrameId = null;

    // Bind event handlers for updating during dragging.
    // this.canvas.on("mouse:move", (e) => this.onMouseMove(e));
    // this.canvas.on("mouse:up", (e) => this.onMouseUp(e));
    this.canvas.on("object:moving", (e) => this.onObjectMoving(e));
  }

  onObjectMoving(event) {
    console.log("Item movement");
    const movedObject = event.target;
    this.updateConnections(movedObject);
  }

  updateConnections(movedObject) {
    this.connections.forEach((conn) => {
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
    this.canvas.renderAll();
  }

  // Create a node (group of a rectangle and a centered text label).
  createNode(text, left, top) {
    const rect = new Rect({
      width: 120,
      height: 60,
      fill: "lightblue",
      stroke: "black",
      strokeWidth: 2,
      rx: 10, // Rounded corners
      ry: 10,
    });

    // Create a text label and manually offset it to the center of the rect.
    const label = new FabricText(text, {
      fontSize: 16,
      fill: "black",
      originX: "center",
      originY: "center",
      left: rect.width / 2,
      top: rect.height / 2,
    });

    // Group the rectangle and text.
    const node = new Group([rect, label], {
      left,
      top,
      selectable: true,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
      hasControls: false,
      subTargetCheck: true, // Allows child objects (e.g. connection circles) to receive events.
    });

    // When hovering, show the red connection circles.
    node.on("mouseover", () => {
      this.showConnectionPoints(node);
    });

    // On mouse out, hide them—but only if the mouse isn’t over one of the connection points.
    node.on("mouseout", (e) => {
      setTimeout(() => {
        if (!this.isHoveringOverChild(node, e)) {
          this.hideConnectionPoints(node);
        }
      }, 200);
    });

    // Hide connection points when dragging.
    node.on("moving", () => {
      this.hideConnectionPoints(node);
    });

    // Add node to canvas and state.
    this.canvas.add(node);
    this.nodes.push(node);
    return node;
  }

  connectNodes(from, to) {
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

    this.canvas.add(line, arrow);
    this.connections.push({ from, to, line, arrow });
  }
}
