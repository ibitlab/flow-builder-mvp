import { Line, Circle } from "fabric";
import { CircleConfigDefault } from "./const.js";

export const Edge = {
  TOP: "top",
  LEFT: "left",
  RIGHT: "right",
  BOTTOM: "bottom",
};

export const ItemBehaviorType = {
  START: "START",
  TARGET: "TARGET",
};

export const createLine = (pointer) => {
  return new Line([pointer.x, pointer.y, pointer.x, pointer.y], {
    stroke: "black",
    strokeWidth: 2,
    selectable: false,
  });
};

// for now, we support 4 points on sides for all items types
export const getEdgePositions = (bounds, space = 5) => {
  // const edges = Object.fromEntries(
  //   Object.entries(Edge).map(([key, value]) => [value, key])
  // );

  return [
    {
      x: bounds.left + bounds.width / 2,
      y: bounds.top - space,
      edge: Edge.TOP,
      space,
    },
    {
      x: bounds.left - space,
      y: bounds.top + bounds.height / 2,
      edge: Edge.LEFT,
      space,
    },
    {
      x: bounds.left + bounds.width + space,
      y: bounds.top + bounds.height / 2,
      edge: Edge.RIGHT,
      space,
    },
    {
      x: bounds.left + bounds.width / 2,
      y: bounds.top + bounds.height + space,
      edge: Edge.BOTTOM,
      space,
    },
  ];
};

// export const prepareEdgeConnectionPointsPositions = (bounds, space = 5) => {
//   return [
//     {
//       x: bounds.left + bounds.width / 2,
//       y: bounds.top - space,
//       edge: Edge.TOP,
//       space,
//     },
//     {
//       x: bounds.left - space,
//       y: bounds.top + bounds.height / 2,
//       edge: Edge.LEFT,
//       space,
//     },
//     {
//       x: bounds.left + bounds.width + space,
//       y: bounds.top + bounds.height / 2,
//       edge: Edge.RIGHT,
//       space,
//     },
//     {
//       x: bounds.left + bounds.width / 2,
//       y: bounds.top + bounds.height + space,
//       edge: Edge.BOTTOM,
//       space,
//     },
//   ];
// };

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

export const isConnectionPoint = (obj) => {
  return obj?.edge && obj?.sideConnectionPoints;
};

export const isFlowChartItemNode = (obj) => {
  return obj?.flowchartItem;
};
