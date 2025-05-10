import { Rect, FabricText, Group } from "fabric";

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
