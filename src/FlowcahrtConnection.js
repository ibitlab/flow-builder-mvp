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
  constructor(manager, fromNode, targetNode, line, targetBluePoint) {
    this.manager = manager;
    this.from = fromNode;
    this.to = targetNode;
    this.line = line;
    // Snap the connection end to the closest blue point.
    this.line.set({
      x2: targetBluePoint.left,
      y2: targetBluePoint.top,
    });
    this.line.setCoords();

    // Create the arrowhead.
    const angle = getAngleBetweenPoints(
      { x: this.line.x1, y: this.line.y1 },
      { x: this.line.x2, y: this.line.y2 }
    );
    // Math.atan2(this.line.y2 - this.line.y1, this.line.x2 - this.line.x1) *
    //   (180 / Math.PI) +
    // 90;
    this.arrow = new Triangle({
      left: targetBluePoint.left,
      top: targetBluePoint.top,
      width: 12,
      height: 16,
      fill: "black",
      originX: "center",
      originY: "center",
      angle: angle,
      selectable: false,
    });
    this.manager.canvas.add(this.arrow);
    // Save the connection.
    this.manager.connections.push({
      from: fromNode,
      to: targetNode,
      line: line,
      arrow: this.arrow,
    });
  }
}
