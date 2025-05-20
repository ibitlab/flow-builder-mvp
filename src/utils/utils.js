import { Edge } from "../constants/constants.js";

/**
 * Calculate the Euclidean distance between two points.
 * @param {Object} p1 - An object with x and y properties.
 * @param {Object} p2 - An object with x and y properties.
 * @returns {number} - The distance between p1 and p2.
 */
export function getDistance(p1, p2) {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

/**
 * Get a center point of a fabric object using its bounding rectangle.
 * @param {Object} obj - A fabric object.
 * @returns {Object} - An object with x and y properties representing the center.
 */
export function getCenter(obj) {
  if (!obj) return;
  const bounds = obj.getBoundingRect();
  return {
    x: bounds.left + bounds.width / 2,
    y: bounds.top + bounds.height / 2,
  };
}

/**
 * Check if a pointer is within a target zone around a fabric object's bounding box.
 * @param {Object} pointer - An object with x and y coordinates (e.g., from canvas.getPointer()).
 * @param {Object} obj - A fabric object.
 * @param {number} [padding=20] - Optional padding value to expand the detection zone.
 * @returns {boolean} - True if the pointer is inside the expanded zone.
 */
export function isInsideTargetZone(pointer, obj, padding = 20) {
  const bounds = obj.getBoundingRect();
  return (
    pointer.x >= bounds.left - padding &&
    pointer.x <= bounds.left + bounds.width + padding &&
    pointer.y >= bounds.top - padding &&
    pointer.y <= bounds.top + bounds.height + padding
  );
}

/**
 * Calculate the angle (in degrees) between two points or Fabric objects.
 * @param {Object} from - Either a Fabric object (`from.left`, `from.top`)
 *                        or an object `{ x, y }`.
 * @param {Object} to - Either a Fabric object (`to.left`, `to.top`)
 *                      or an object `{ x, y }`.
 * @returns {number} - Angle in degrees.
 */
export function getAngleBetweenPoints(from, to) {
  // Support both Fabric objects and raw coordinates
  const x1 = from.left ?? from.x;
  const y1 = from.top ?? from.y;
  const x2 = to.left ?? to.x;
  const y2 = to.top ?? to.y;

  return Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI) + 90;
}

// TODO we need to have this point placeholders in init
export function findClosestBluePoint(node) {
  if (!node.connectionPoints) return null;

  let minDist = Infinity;
  let closestPoint = null;
  // TODO
  const nodeCenter = getCenter(node); // Using utility

  node.connectionEdges.forEach((cp) => {
    const dist = getDistance(nodeCenter, { x: cp.left, y: cp.top }); // Using utility
    if (dist < minDist) {
      minDist = dist;
      closestPoint = cp;
    }
  });

  return closestPoint;
}

export function removeItem(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

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

export const isConnectionPoint = (obj) => {
  return obj?.edge && obj?.sideConnectionPoints;
};

export const isFlowChartItemNode = (obj) => {
  return obj?.flowchartItem;
};
