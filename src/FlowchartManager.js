import { Canvas, Circle, Line } from "fabric";
import * as styles from "./styles.module.css";

import {
  getDistance,
  getCenter,
  isInsideTargetZone,
  findClosestBluePoint,
  removeItem,
} from "./utils.js";

import { FlowchartItem } from "./FlowchartItem.js";
import { FlowchartConnection } from "./FlowchartConnection.js";
import { FlowchartConnectionManager } from "./FlowchartConnectionManager.js";
import {
  FlowchartSideConnectionPoints,
  ItemInteractionType,
} from "./FlowchartSideConnectionPoints.js";

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
    this.items = [];
    this.connectionManager = new FlowchartConnectionManager(this);
    // init Side connection Points for Start and End Item
    this.startSideConnectionPoints = new FlowchartSideConnectionPoints(
      this,
      ItemInteractionType.START
    );
    this.targetSideConnectionPoints = new FlowchartSideConnectionPoints(
      this,
      ItemInteractionType.TARGET
    );

    // TODO review
    this.currentLine = null;
    this.connectionStartCircle = null;
    this.currentTargetBluePoints = [];
    this.animationFrameId = null;

    // Bind event handlers
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onObjectMoving = this.onObjectMoving.bind(this);
    this.onObjectScaling = this.onObjectScaling.bind(this);
    this.onSelectionCreated = this.onSelectionCreated.bind(this);
    this.onSelectionCleared = this.onSelectionCleared.bind(this);

    this.onKeydown = this.onKeydown.bind(this);
    this.attachEvents();

    // Set the canvas wrapper to be focusable
    // Help determine if delete/backspace operation on canvas or other inputs
    this.canvas.wrapperEl.setAttribute("tabindex", "-1");
    this.canvas.wrapperEl.classList.add(styles.canvasWrapper);
  }

  attachEvents() {
    // Attach events using the pre-bound handlers
    this.canvas.on("mouse:move", this.onMouseMove);
    this.canvas.on("mouse:up", this.onMouseUp);
    this.canvas.on("object:moving", this.onObjectMoving);
    this.canvas.on("object:scaling", this.onObjectScaling);
    this.canvas.on("selection:created", this.onSelectionCreated);
    this.canvas.on("selection:cleared", this.onSelectionCleared);
  }

  // Clean up and remove node properly
  destroy() {
    // Remove event listeners
    this.canvas.off("mouse:move", this.onMouseMove);
    this.canvas.off("mouse:up", this.onMouseUp);
    this.canvas.off("object:moving", this.onObjectMoving);
    this.canvas.off("object:scaling", this.onObjectScaling);
    this.canvas.off("selection:created", this.onSelectionCreated);
    this.canvas.off("selection:cleared", this.onSelectionCleared);
    document.removeEventListener("keydown", this.onKeydown);
  }

  addItem(item) {
    this.items.push(item);
    this.canvas.add(item.node);
  }

  deleteItem(item) {
    item.destroy();
    this.canvas.remove(item.node);
    removeItem(this.items, item);

    // TODO batch for multiple, in the future?
    this.canvas.requestRenderAll();
  }

  // Create a node using the FlowchartItem class.
  createItem(text, left, top) {
    const item = new FlowchartItem(text, left, top, this);
    this.addItem(item);
    return item;
  }

  onSelectionCreated() {
    document.addEventListener("keydown", this.onKeydown);
  }

  onSelectionCleared() {
    document.removeEventListener("keydown", this.onKeydown);
  }

  onKeydown(event) {
    if (document.activeElement !== this.canvas.wrapperEl) {
      return; // Prevent deletion if focus is elsewhere
    }

    if (event.key === "Delete" || event.key === "Backspace") {
      const activeObject = this.canvas.getActiveObject();
      if (activeObject && activeObject.flowchartItem) {
        this.deleteItem(activeObject.flowchartItem);
      }
    }
  }

  onObjectScaling() {
    // TODO this doesn't help prevent scaling multiple
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
    // TBD handle multiple object movement
    this.updateConnections(movedObject);
  }

  updateConnections(movedObject) {
    this.connectionManager.updateConnections(movedObject);
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

  // Finalize connection on mouse up.
  onMouseUp(e) {
    if (this.currentLine) {
      const pointer = this.canvas.getPointer(e.e);
      let targetNode = null;
      // Search for a target node (not the source) within an expanded target zone.
      this.items.forEach(({ node }) => {
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
          this.connectionManager.addConnection(
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

    // if (blueCircle.containsPoint(pointer)) {
    //   blueCircle.set({ radius: 7, fill: "white" });
    //   canvas.renderAll();
    // }

    // const objectsBelowMouse = this.canvas
    //   .getObjects()
    //   .filter((obj) => obj.containsPoint(pointer))
    //   .map((obj) => ({
    //     type: obj.type,
    //     left: obj.left,
    //     top: obj.top,
    //     width: obj.width || null,
    //     height: obj.height || null,
    //     radius: obj.radius || null, // Only for circles
    //     fill: obj.fill,
    //     stroke: obj.stroke,
    //     opacity: obj.opacity,
    //   }));
    // if (objectsBelowMouse.length > 0) {
    //   // console.log("Objects below mouse:");
    //   console.dir(objectsBelowMouse);
    // }

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
    this.items.forEach(({ node }) => {
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

        // stroke: "black",
        // strokeWidth: 1,
      });

      // Hover animation
      // blueCircle.on("mouseover", () => {
      //   blueCircle.set({
      //     radius: 7, // Slightly increase size
      //     fill: "white", // Make it just a border
      //   });
      //   blueCircle.canvas.renderAll(); // Update canvas
      // });

      // blueCircle.on("mouseout", () => {
      //   blueCircle.set({
      //     radius: 5, // Restore original size
      //     fill: "yellow", // Restore original fill
      //   });
      //   blueCircle.canvas.renderAll();
      // });

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
