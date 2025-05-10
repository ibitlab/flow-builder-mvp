import { Line, Circle } from "fabric";
import { createNode } from "./fabricUtils.js";

/* ============================
   FlowchartItem Class Module
   ============================
   Responsibilities:
   • Encapsulate a node’s creation (rectangle + centered text)
   • Manage node‐specific events (mouseover, mouseout, moving)
   • Show/hide red connection points via internal methods
   • Bind those events so the central manager’s utilities (e.g. isHoveringOverChild)
     can also be used.
--------------------------------- */
export class FlowchartItem {
  constructor(text, left, top, manager) {
    // Save a reference to the manager (to access the Fabric canvas, etc.)
    this.manager = manager;

    this.node = createNode(text, 120, 60, left, top);

    // Prepare a property to hold our connection points.
    this.node.connectionPoints = [];

    // Bind events.
    this.node.on("mouseover", () => this.showConnectionPoints());
    this.node.on("mouseout", (e) => this.onMouseOut(e));
    this.node.on("moving", () => this.onMoving());

    // Add the node to the canvas.
    this.manager.canvas.add(this.node);
  }

  /** Clean up and remove node properly */
  destroy() {
    // Remove event listeners
    this.node.off("mouseover");
    this.node.off("mouseout");
    this.node.off("moving");

    // Remove connection points
    // TODO move this into separate points component
    // TODO remove all connections
    if (this.node.connectionPoints) {
      this.node.connectionPoints.forEach((cp) => cp.off("mousedown"));
      this.node.connectionPoints.forEach((cp) =>
        this.manager.canvas.remove(cp)
      );
      this.node.connectionPoints = [];
    }

    // Remove node from canvas
    this.manager.canvas.remove(this.node);
    this.manager.canvas.requestRenderAll();
  }

  onMouseOut(e) {
    setTimeout(() => {
      if (!this.manager.isHoveringOverChild(this.node, e)) {
        this.hideConnectionPoints();
      }
    }, 200);
  }

  onMoving() {
    this.hideConnectionPoints();
    this.manager.removeTargetConnectionPoints();
  }

  // Create and show red connection circles along the node’s edges.
  showConnectionPoints() {
    // Clear any existing connection points.
    this.hideConnectionPoints();

    const bounds = this.node.getBoundingRect();
    // Define positions for top, left, right, and bottom.
    const positions = [
      { x: bounds.left + bounds.width / 2, y: bounds.top, edge: "top" },
      { x: bounds.left, y: bounds.top + bounds.height / 2, edge: "left" },
      {
        x: bounds.left + bounds.width,
        y: bounds.top + bounds.height / 2,
        edge: "right",
      },
      {
        x: bounds.left + bounds.width / 2,
        y: bounds.top + bounds.height,
        edge: "bottom",
      },
    ];

    positions.forEach((pt) => {
      const circle = new Circle({
        left: pt.x,
        top: pt.y,
        radius: 5,
        fill: "red",
        stroke: "black",
        strokeWidth: 1,
        selectable: false, // not draggable/selected
        evented: true, // allow clicks (for starting a connection)
        originX: "center",
        originY: "center",
      });
      circle.edge = pt.edge;
      circle.nodeParent = this.node;

      // When you press down on the red circle, start a connection.
      circle.on("mousedown", (e) => {
        e.e.stopPropagation();
        // Temporarily disable node dragging.
        circle.nodeParent.selectable = false;
        this.manager.canvas.selection = false;
        // Tell the manager which connection point we started at.
        this.manager.connectionStartCircle = circle;
        const pointer = this.manager.canvas.getPointer(e.e);
        this.manager.currentLine = new Line(
          [pointer.x, pointer.y, pointer.x, pointer.y],
          {
            stroke: "black",
            strokeWidth: 2,
            selectable: false,
          }
        );
        this.manager.canvas.add(this.manager.currentLine);
      });

      // Prevent the red circle from stealing focus.
      circle.on("mouseover", (e) => {
        e.e.stopPropagation();
        this.manager.canvas.discardActiveObject();
        this.manager.canvas.requestRenderAll();
      });

      this.manager.canvas.add(circle);
      this.node.connectionPoints.push(circle);
    });
  }

  // Remove (hide) all red connection circles from this node.
  hideConnectionPoints() {
    if (this.node.connectionPoints) {
      this.node.connectionPoints.forEach((cp) =>
        this.manager.canvas.remove(cp)
      );
      this.node.connectionPoints = [];
    }
  }
}
