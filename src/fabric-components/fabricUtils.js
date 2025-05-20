import { Rect, Textbox, Group, Triangle, Line, Circle } from "fabric";
import { getAngleBetweenPoints } from "../utils/utils.js";
import { CircleConfigDefault } from "../constants/constants.js";

export function createNode(text, type, left, top, width = 120, height = 60) {
  // Create the base rectangle.
  const rect = new Rect({
    width: width,
    height: height,
    fill: "lightblue",
    stroke: "black",
    strokeWidth: 2,
    rx: 10,
    ry: 10,
  });

  // Create a text label, positioning it at the center of the rect.
  // const label = new FabricText(text, {
  //   fontSize: 16,
  //   fill: "black",
  //   originX: "center",
  //   originY: "center",
  //   left: rect.width / 2,
  //   top: rect.height / 2,
  // });

  const label = new Textbox(`${type}\n${text}`, {
    fontSize: 16,
    fill: "black",
    width: rect.width - 20, // Adjust width to fit inside the rectangle
    textAlign: "center",
    originX: "center",
    originY: "center",
    left: rect.left + rect.width / 2,
    top: rect.top + rect.height / 2,
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
      selectable: false,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
      hasControls: false,
    }
  );

  // Create the arrowhead.
  const angle = getAngleBetweenPoints(
    { x: fromEdgePosition.x, y: fromEdgePosition.y },
    { x: toEdgePosition.x, y: toEdgePosition.y }
  );

  // TODO move out
  // const ArrowHeight = 16;

  // // Adjust position dynamically based on rotation
  // const angleRad = util.degreesToRadians(angle);
  // console.log("angleRad==", angleRad);
  // const offsetX = Math.sin(angleRad) * (ArrowHeight / 2);
  // const offsetY = Math.cos(angleRad) * (ArrowHeight / 2);

  that.arrow = new Triangle({
    left: toEdgePosition.x,
    top: toEdgePosition.y,
    // left: toEdgePosition.x - offsetX,
    // top: toEdgePosition.y - offsetY,
    width: 12,
    height: 16,
    fill: "black",
    originX: "center",
    originY: "top",
    angle: angle,
    selectable: false,
    lockScalingX: true,
    lockScalingY: true,
    lockRotation: true,
    hasControls: false,
  });
}

export const createLine = (pointer) => {
  return new Line([pointer.x, pointer.y, pointer.x, pointer.y], {
    stroke: "black",
    strokeWidth: 2,
    selectable: false,
    lockScalingX: true,
    lockScalingY: true,
    lockRotation: true,
    hasControls: false,
  });
};

export const createCircle = (pt) => {
  const circle = new Circle({
    ...CircleConfigDefault,
    left: pt.x,
    top: pt.y,
    selectable: false, // not draggable/selected
    evented: true, // allow clicks (for starting a connection)
    originX: "center",
    originY: "center",
  });

  // // Hover animation
  // circle.on("mouseover", () => {
  //   circle.set({
  //     radius: 7, // Slightly increase size
  //     fill: "white", // Make it just a border
  //   });
  //   circle.canvas.renderAll(); // Update canvas
  // });

  // circle.on("mouseout", () => {
  //   circle.set({
  //     radius: 5, // Restore original size
  //     fill: "red", // Restore original fill
  //   });
  //   circle.canvas.renderAll();
  // });

  return circle;
};
