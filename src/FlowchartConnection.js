import { Triangle } from "fabric";
import { getAngleBetweenPoints } from "./utils.js";

/* ============================
   FlowchartConnection Class Module
   ============================
   Responsibilities:
   • Encapsulate the process of finalizing a connection:
       – snapping the temporary line to a blue target point,
       – drawing an arrowhead,
       – and storing the connection.
--------------------------------- */
export class FlowchartConnection {
  constructor(fromNode, targetNode, line, targetPoint) {
    // TODO use targetPoint.edge to attach for correct point
    this.from = fromNode;
    this.to = targetNode;
    this.line = line;
    // Snap the connection end to the closest blue point.
    this.line.set({
      x2: targetPoint.left,
      y2: targetPoint.top,
    });
    this.line.setCoords();

    // Create the arrowhead.
    const angle = getAngleBetweenPoints(
      { x: this.line.x1, y: this.line.y1 },
      { x: this.line.x2, y: this.line.y2 }
    );

    this.arrow = new Triangle({
      left: targetPoint.left,
      top: targetPoint.top,
      width: 12,
      height: 16,
      fill: "black",
      originX: "center",
      originY: "center",
      angle: angle,
      selectable: false,
    });
  }
}
