import { Rect, FabricText, Group, Triangle, Line } from "fabric";
import { getAngleBetweenPoints } from "../utils/utils.js";

export function createNode(text, width, height, left, top) {
  // Create the base rectangle.
  const rect = new Rect({
    width: 120,
    height: 60,
    fill: "lightblue",
    stroke: "black",
    strokeWidth: 2,
    rx: 10,
    ry: 10,
  });

  // Create a text label, positioning it at the center of the rect.
  const label = new FabricText(text, {
    fontSize: 16,
    fill: "black",
    originX: "center",
    originY: "center",
    left: rect.width / 2,
    top: rect.height / 2,
  });

  // Group them together.
  return new Group([rect, label], {
    left,
    top,
    selectable: true,
    lockScalingX: true,
    lockScalingY: true,
    lockRotation: true,
    hasControls: false,
    subTargetCheck: true,
  });
}

export function createConnectionElements(
  // TODO rework this
  that,
  fromEdgePosition,
  toEdgePosition
) {
  that.line = new Line(
    [
      fromEdgePosition.x,
      fromEdgePosition.y,
      toEdgePosition.x,
      toEdgePosition.y,
    ],
    {
      stroke: "black",
      strokeWidth: 2,
    }
  );

  // Create the arrowhead.
  const angle = getAngleBetweenPoints(
    { x: fromEdgePosition.x, y: fromEdgePosition.y },
    { x: toEdgePosition.x, y: toEdgePosition.y }
  );

  that.arrow = new Triangle({
    left: toEdgePosition.x,
    top: toEdgePosition.y,
    width: 12,
    height: 16,
    fill: "black",
    originX: "center",
    originY: "center",
    angle: angle,
    selectable: false,
  });
}
