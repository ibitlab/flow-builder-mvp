import { Triangle, Line } from "fabric";
import { getAngleBetweenPoints } from "./utils.js";

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
