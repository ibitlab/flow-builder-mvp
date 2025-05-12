import { Line, Circle } from "fabric";
// import { createNode } from "./fabricUtils.js";

// TODO move out
export const Edge = {
  TOP: "top",
  LEFT: "left",
  RIGHT: "right",
  BOTTOM: "bottom",
};

export const ItemInteractionType = {
  START: "START",
  TARGET: "TARGET",
};

const getEdgePositions = (bounds) => {
  return [
    { x: bounds.left + bounds.width / 2, y: bounds.top, edge: Edge.TOP },
    { x: bounds.left, y: bounds.top + bounds.height / 2, edge: Edge.LEFT },
    {
      x: bounds.left + bounds.width,
      y: bounds.top + bounds.height / 2,
      edge: Edge.RIGHT,
    },
    {
      x: bounds.left + bounds.width / 2,
      y: bounds.top + bounds.height,
      edge: Edge.BOTTOM,
    },
  ];
};

export const circleConfigDefault = {
  radius: 5,
  fill: "rgba(128, 188, 254, 0.6)",
  stroke: "black",
  strokeWidth: 1,
};

const createCircle = (pt) => {
  const circle = new Circle({
    ...circleConfigDefault,
    left: pt.x,
    top: pt.y,
    selectable: false, // not draggable/selected
    evented: true, // allow clicks (for starting a connection)
    originX: "center",
    originY: "center",
  });

  // Hover animation
  circle.on("mouseover", () => {
    circle.set({
      radius: 7, // Slightly increase size
      fill: "white", // Make it just a border
    });
    circle.canvas.renderAll(); // Update canvas
  });

  circle.on("mouseout", () => {
    circle.set({
      radius: 5, // Restore original size
      fill: "red", // Restore original fill
    });
    circle.canvas.renderAll();
  });

  // return circle;
};

export class FlowchartSideConnectionPoints {
  constructor(manager, itemInteractionType) {
    this.manager = manager;
    this.itemInteractionType = itemInteractionType;

    // this.node.connectionPoints = [];
  }

  destroy() {}

  // Create and show red connection circles along the node’s edges.
  showConnectionPoints() {
    // Clear any existing connection points.
    this.hideConnectionPoints();

    const bounds = this.node.getBoundingRect();
    // Define positions for top, left, right, and bottom.
    const positions = getEdgePositions(bounds);

    positions.forEach((pt) => {
      const circle = createCircle(pt);

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
