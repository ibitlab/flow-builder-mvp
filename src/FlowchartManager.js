import { Canvas, Circle, Line } from "fabric";

import {
  getDistance,
  getCenter,
  getAngleBetweenPoints,
  isInsideTargetZone,
  findClosestBluePoint,
} from "./utils.js";

import { FlowchartItem } from "./FlowchartItem.js";
import { FlowchartConnection } from "./FlowcahrtConnection.js";

const chartDefaultConfig = {
  selection: true,
  subTargetCheck: true,
  backgroundColor: "#f0f0f0",
  width: 800,
  height: 500,
};
/* ============================
   FlowchartManager Class Module
   ============================
   Responsibilities:
   • Manage a Fabric canvas and maintain a state of nodes and connections.
   • Coordinate interaction between nodes and delegate events.
   • Handle temporary drawing of connections using mouse events.
--------------------------------- */
export class FlowchartManager {
  constructor(canvasId, config = {}) {
    // Initialize Fabric canvas using a configuration object.
    this.canvas = new Canvas(
      canvasId,
      Object.assign(chartDefaultConfig, config)
    );
    // console.log("this.canvas=", this.canvas);
    // Central state.
    this.nodes = [];
    this.connections = [];
    // Variables for interactive connection drawing.
    this.currentLine = null;
    this.connectionStartCircle = null;
    this.currentTargetBluePoints = [];
    this.animationFrameId = null;

    // Bind canvas events.
    this.canvas.on("mouse:move", (e) => this.onMouseMove(e));
    this.canvas.on("mouse:up", (e) => this.onMouseUp(e));
    this.canvas.on("object:moving", (e) => this.onObjectMoving(e));
    this.canvas.on("object:scaling", (e) => this.onObjectScaling(e));
    // this.canvas.on("selection:created", (e) => this.onSelectionCreated(e));
  }

  // onObjectScaling() {
  //   // const obj = event.target;
  //   // // Ensure scaling is blocked for groups (multiple objects selected)
  //   // if (obj.type === "activeSelection") {
  //   //   obj.getObjects().forEach((item) => {
  //   //     item.set({
  //   //       scaleX: 1,
  //   //       scaleY: 1,
  //   //     });
  //   //     item.setCoords(); // Ensure Fabric.js recalculates positions
  //   //   });
  //   //   this.canvas.requestRenderAll(); // Apply changes
  //   // }
  // }

  onObjectScaling() {
    const activeObject = this.canvas.getActiveObject();
    console.dir(activeObject);
    if (!activeObject) return; // Ensure an object is selected

    // If multiple objects are selected, reset their scaling
    if (activeObject._objects) {
      activeObject._objects.forEach((item) => {
        item.set({
          scaleX: 1,
          scaleY: 1,
        });
        item.setCoords();
      });
      this.canvas.requestRenderAll();
    }
  }

  onObjectMoving(event) {
    // When a node moves, update any connected lines.
    const movedObject = event.target;
    this.updateConnections(movedObject);

    // const movedObject = event.target;

    // // Hide connection points when dragging any node
    // if (movedObject.connectionPoints) {
    //   this.hideConnectionPoints(movedObject);
    // }

    // // Update any connections related to the moved object
    // this.updateConnections(movedObject);
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
        // Update arrow position.
        conn.arrow.set({
          left: conn.to.left + 60,
          top: conn.to.top + 30,
          angle: getAngleBetweenPoints(conn.from, conn.to),

          // Math.atan2(
          //   conn.to.top - conn.from.top,
          //   conn.to.left - conn.from.left
          // ) *
          //   (180 / Math.PI) +
          // 90,
        });
        conn.arrow.setCoords();
      }
    });
    this.canvas.renderAll();
  }

  // A helper used by node events to check if the pointer is over one of the node's children.
  isHoveringOverChild(node, event) {
    const pointer = this.canvas.getPointer(event.e);
    return (node.connectionPoints || []).some((cp) => {
      const bounds = cp.getBoundingRect();
      return (
        pointer.x >= bounds.left &&
        pointer.x <= bounds.left + bounds.width &&
        pointer.y >= bounds.top &&
        pointer.y <= bounds.top + bounds.height
      );
    });
  }

  // Create a node using the FlowchartNode class.
  createNode(text, left, top) {
    const nodeObj = new FlowchartItem(text, left, top, this);
    this.nodes.push(nodeObj.node);
    return nodeObj.node;
  }

  // Finalize connection on mouse up.
  onMouseUp(e) {
    if (this.currentLine) {
      const pointer = this.canvas.getPointer(e.e);
      let targetNode = null;
      // Search for a target node (not the source) within an expanded target zone.
      this.nodes.forEach((node) => {
        if (
          this.connectionStartCircle &&
          node === this.connectionStartCircle.nodeParent
        )
          return;
        if (isInsideTargetZone(pointer, node)) {
          targetNode = node;
        }
      });

      if (targetNode && this.currentTargetBluePoints.length > 0) {
        // Find the closest blue point.
        let closestPoint = null;
        let minDist = Infinity;

        // TODO extract
        this.currentTargetBluePoints.forEach((bp) => {
          const dx = bp.left - pointer.x;
          const dy = bp.top - pointer.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDist) {
            minDist = dist;
            closestPoint = bp;
          }
        });

        if (closestPoint) {
          // Instantiate a FlowchartConnection to finalize the arrow.
          new FlowchartConnection(
            this,
            this.connectionStartCircle.nodeParent,
            targetNode,
            this.currentLine,
            closestPoint
          );
        }
      } else {
        // If no valid target was found, remove the temporary line.
        this.canvas.remove(this.currentLine);
      }

      // Clean up temporary blue connection points.
      if (this.currentTargetBluePoints.length > 0) {
        this.removeTargetConnectionPoints();
      }
      // Re-enable selection on the source node.
      if (this.connectionStartCircle && this.connectionStartCircle.nodeParent) {
        this.connectionStartCircle.nodeParent.selectable = true;
      }
      this.canvas.selection = true;
      this.currentLine = null;
      this.connectionStartCircle = null;
      this.canvas.requestRenderAll();
    }
  }

  // Use requestAnimationFrame to update the temporary connection line smoothly.
  onMouseMove(e) {
    const pointer = this.canvas.getPointer(e.e);
    if (this.currentLine) {
      if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = requestAnimationFrame(() => {
        this.currentLine.set({ x2: pointer.x, y2: pointer.y });
        this.currentLine.setCoords();
        this.canvas.requestRenderAll();
      });
    }

    // Determine the closest target node (if any) under the pointer, ignoring the source.
    let closestTarget = null;
    let minDist = Infinity;
    this.nodes.forEach((node) => {
      if (
        this.connectionStartCircle &&
        node === this.connectionStartCircle.nodeParent
      )
        return;
      if (isInsideTargetZone(pointer, node)) {
        // const bounds = node.getBoundingRect();
        // const centerX = bounds.left + bounds.width / 2;
        // const centerY = bounds.top + bounds.height / 2;
        // const dist = Math.hypot(pointer.x - centerX, pointer.y - centerY);
        const center = getCenter(node);
        const dist = getDistance(pointer, center);
        if (dist < minDist) {
          minDist = dist;
          closestTarget = node;
        }
      }
    });

    if (closestTarget && this.currentTargetBluePoints.length === 0) {
      this.currentTargetBluePoints =
        this.showTargetConnectionPoints(closestTarget);
    } else if (!closestTarget && this.currentTargetBluePoints.length > 0) {
      this.removeTargetConnectionPoints();
    }
  }

  // Show blue connection circles on the target node.
  showTargetConnectionPoints(node) {
    const bounds = node.getBoundingRect();
    const positions = [
      { x: bounds.left + bounds.width / 2, y: bounds.top },
      { x: bounds.left, y: bounds.top + bounds.height / 2 },
      { x: bounds.left + bounds.width, y: bounds.top + bounds.height / 2 },
      { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height },
    ];

    let bluePoints = [];
    positions.forEach((pt) => {
      const blueCircle = new Circle({
        left: pt.x,
        top: pt.y,
        radius: 5,
        fill: "blue",
        selectable: false,
        evented: false,
        originX: "center",
        originY: "center",
      });
      this.canvas.add(blueCircle);
      bluePoints.push(blueCircle);
    });
    return bluePoints;
  }

  // Remove blue connection indicators.
  removeTargetConnectionPoints() {
    this.currentTargetBluePoints?.forEach((p) => this.canvas.remove(p));
    this.currentTargetBluePoints = [];
  }

  // TODO rework it. we need support 4 points
  connectNodes(fromNode, toNode) {
    // Find the closest blue connection point on the target node.
    const closestPoint = findClosestBluePoint(toNode);

    if (!closestPoint) {
      console.warn("No valid connection point found.");
      return;
    }

    // Create a temporary line.
    const tempLine = new Line(
      [
        fromNode.left + 60,
        fromNode.top + 30,
        closestPoint.left,
        closestPoint.top,
      ],
      {
        stroke: "black",
        strokeWidth: 2,
        selectable: false,
      }
    );
    this.canvas.add(tempLine);

    // Use the FlowchartConnection class to finalize the connection.
    new FlowchartConnection(this, fromNode, toNode, tempLine, closestPoint);
  }
}
