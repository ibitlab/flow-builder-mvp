import { Canvas, Line } from "fabric";
import * as styles from "./styles.module.css";

import {
  getDistance,
  getCenter,
  isInsideTargetZone,
  findClosestBluePoint,
  removeItem,
} from "./utils.js";

import { FlowchartItem } from "./FlowchartItem.js";
import { FlowchartConnection } from "./FlowchartConnection.js";
import { FlowchartConnectionManager } from "./FlowchartConnectionManager.js";
import {
  createLine,
  isConnectionPoint,
  isFlowChartItemNode,
  ItemBehaviorType,
} from "./FlowchartSideConnectionPointsUtils.js";
import { ConnectionPointDiam, SpaceToConnectionPointCenter } from "./const.js";

const chartDefaultConfig = {
  selection: true,
  subTargetCheck: true,
  backgroundColor: "#f0f0f0",
  width: 800,
  height: 500,
};

export class FlowchartManager {
  constructor(canvasId, config = {}) {
    // Initialize Fabric canvas using a configuration object.
    this.canvas = new Canvas(
      canvasId,
      Object.assign(chartDefaultConfig, config)
    );
    this.items = [];
    this.connectionManager = new FlowchartConnectionManager(this);

    this.isMovement = false;

    this.animationFrameId = null;

    // Bind event handlers
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onObjectMoving = this.onObjectMoving.bind(this);
    this.onObjectScaling = this.onObjectScaling.bind(this);
    this.onSelectionCreated = this.onSelectionCreated.bind(this);
    this.onSelectionCleared = this.onSelectionCleared.bind(this);

    this.onKeydown = this.onKeydown.bind(this);
    this.attachEvents();

    // Set the canvas wrapper to be focusable
    // Help determine if delete/backspace operation on canvas or other inputs
    this.canvas.wrapperEl.setAttribute("tabindex", "-1");
    this.canvas.wrapperEl.classList.add(styles.canvasWrapper);
  }

  attachEvents() {
    // Attach events using the pre-bound handlers
    this.canvas.on("mouse:move", this.onMouseMove);
    this.canvas.on("mouse:down", this.onMouseDown);
    this.canvas.on("mouse:up", this.onMouseUp);
    this.canvas.on("object:moving", this.onObjectMoving);
    this.canvas.on("object:scaling", this.onObjectScaling);
    this.canvas.on("selection:created", this.onSelectionCreated);
    this.canvas.on("selection:cleared", this.onSelectionCleared);
  }

  // Clean up and remove node properly
  destroy() {
    // Remove event listeners
    this.canvas.off("mouse:move", this.onMouseMove);
    this.canvas.off("mouse:down", this.onMouseDown);
    this.canvas.off("mouse:up", this.onMouseUp);
    this.canvas.off("object:moving", this.onObjectMoving);
    this.canvas.off("object:scaling", this.onObjectScaling);
    this.canvas.off("selection:created", this.onSelectionCreated);
    this.canvas.off("selection:cleared", this.onSelectionCleared);
    document.removeEventListener("keydown", this.onKeydown);
  }

  addItem(item) {
    this.items.push(item);
    this.canvas.add(item.node);
  }

  deleteItem(item) {
    item.destroy();
    this.canvas.remove(item.node);
    removeItem(this.items, item);

    // TODO batch for multiple, in the future?
    this.canvas.requestRenderAll();
  }

  // Create a node using the FlowchartItem class.
  createItem(text, left, top) {
    const item = new FlowchartItem(text, left, top, this);
    this.addItem(item);
    return item;
  }

  onSelectionCreated() {
    document.addEventListener("keydown", this.onKeydown);
  }

  onSelectionCleared() {
    document.removeEventListener("keydown", this.onKeydown);
  }

  onKeydown(event) {
    if (document.activeElement !== this.canvas.wrapperEl) {
      return; // Prevent deletion if focus is elsewhere
    }

    if (event.key === "Delete" || event.key === "Backspace") {
      const activeObject = this.canvas.getActiveObject();
      if (activeObject && activeObject.flowchartItem) {
        this.deleteItem(activeObject.flowchartItem);
      }
    }
  }

  onObjectScaling() {}

  onObjectMoving(event) {
    this.connectionManager.hideStartConnectionPoints();
    this.connectionManager.hideTargetConnectionPoints();

    const movedObject = event.target;
    // When a node moves, update any connected lines.
    // TBD handle multiple object movement
    this.connectionManager.updateConnections(movedObject);
  }

  onMouseDown(e) {
    this.isMovement = true;

    if (isConnectionPoint(e.target)) {
      const connectionCircle = e.target;
      const sideConnectionPoints = connectionCircle?.sideConnectionPoints;
      if (sideConnectionPoints.itemBehaviorType === ItemBehaviorType.START) {
        // TODO review it needs
        e.e.stopPropagation();
        // start line arrow
        const pointer = this.canvas.getPointer(e.e);

        // When you press down on the start circle, start a connection.
        // Temporarily disable node dragging.
        connectionCircle.sideConnectionPoints.item.node.selectable = false;
        this.canvas.selection = false;
        // Tell the manager which connection point we started at.
        this.connectionManager.connectionStartCircle = connectionCircle;
        this.connectionManager.currentLine = createLine(pointer);
        this.canvas.add(this.connectionManager.currentLine);
      }
    }
  }

  // Finalize connection on mouse up.
  onMouseUp(e) {
    this.isMovement = false;
    if (this.connectionManager.currentLine) {
      // const pointer = this.canvas.getPointer(e.e);
      // let targetNode = null;
      // // Search for a target node (not the source) within an expanded target zone.
      // this.items.forEach(({ node }) => {
      //   if (
      //     this.connectionManager.connectionStartCircle &&
      //     node ===
      //       this.connectionManager.connectionStartCircle.sideConnectionPoints
      //         .item.node
      //   ) {
      //     return;
      //   }

      //   // TODO possible collision if nodes overlaps
      //   if (isInsideTargetZone(pointer, node)) {
      //     targetNode = node;
      //   }
      // });

      if (isConnectionPoint(e.target)) {
        const targetConnectionCircle = e.target;
        const sideConnectionPoints =
          targetConnectionCircle?.sideConnectionPoints;
        if (sideConnectionPoints.itemBehaviorType === ItemBehaviorType.TARGET) {
          // Instantiate a FlowchartConnection to finalize the arrow.
          this.connectionManager.addConnection(
            this.connectionManager.connectionStartCircle.sideConnectionPoints
              .item.node,
            targetConnectionCircle.sideConnectionPoints.item.node,
            this.connectionManager.currentLine,
            targetConnectionCircle
          );
        }
      } else {
        // If no valid target was found, remove the temporary line.
        this.canvas.remove(this.connectionManager.currentLine);
      }

      // const targetNode = this.connectionManager.targetSideConnectionPoints;
      // if (targetNode) {
      //   // Find the closest blue point.
      //   let closestPoint = null;
      //   let minDist = Infinity;

      //   // TODO extract
      //   this.currentTargetBluePoints.forEach((bp) => {
      //     const dx = bp.left - pointer.x;
      //     const dy = bp.top - pointer.y;
      //     const dist = Math.sqrt(dx * dx + dy * dy);
      //     if (dist < minDist) {
      //       minDist = dist;
      //       closestPoint = bp;
      //     }
      //   });

      //   if (closestPoint) {
      //     // Instantiate a FlowchartConnection to finalize the arrow.
      //     this.connectionManager.addConnection(
      //       this.connectionManager.connectionStartCircle.sideConnectionPoints
      //         .item.node,
      //       targetNode,
      //       this.connectionManager.currentLine,
      //       closestPoint
      //     );
      //   }
      // } else {
      //   // If no valid target was found, remove the temporary line.
      //   this.canvas.remove(this.connectionManager.currentLine);
      // }

      if (this.connectionManager.targetSideConnectionPoints) {
        this.connectionManager.hideTargetConnectionPoints();
      }

      // Re-enable selection on the source node.
      if (
        this.connectionManager.connectionStartCircle &&
        this.connectionManager.connectionStartCircle.sideConnectionPoints.item
          .node
      ) {
        this.connectionManager.connectionStartCircle.sideConnectionPoints.item.node.selectable = true;
      }
      this.canvas.selection = true;
      this.connectionManager.currentLine = null;
      this.connectionManager.connectionStartCircle = null;
      this.canvas.requestRenderAll();
    }
  }

  // Use requestAnimationFrame to update the temporary connection line smoothly.
  onMouseMove(e) {
    const pointer = this.canvas.getPointer(e.e);
    const targets = this.canvas.findTarget(e.e, true) || [];
    // console.log("Stacked objects under mouse:", targets);

    // no start Points
    // do not show on move!
    if (
      isFlowChartItemNode(targets) &&
      !this.connectionManager.startSideConnectionPoints &&
      !this.isMovement
    ) {
      this.connectionManager.showStartConnectionPoints(targets.flowchartItem);
    }

    // check if mouse on Node or near connection points, then continue show start, else hide with debounce
    // is start points, check if not lost focus it on node
    if (this.connectionManager.startSideConnectionPoints) {
      // focus on node OR
      // focus on its point OR
      // focus on rect covering all points OR
      // started draw line
      // draw line in progress
      if (
        this.connectionManager.startSideConnectionPoints.item.node ===
          targets ||
        isInsideTargetZone(
          pointer,
          this.connectionManager.startSideConnectionPoints.item.node,
          SpaceToConnectionPointCenter + ConnectionPointDiam
        ) ||
        this.connectionManager.currentLine
        // !this.isMovement
      ) {
        // nop
      } else {
        this.connectionManager.hideStartConnectionPoints();
      }

      // else
      // add task to remove startSideConnectionPoints with debounce?
      // but if we focus something else then we should remove it immediately
      // this.connectionManager.hideStartConnectionPoints();
    }

    // move arrow
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = requestAnimationFrame(() => {
      if (this.connectionManager.currentLine) {
        this.connectionManager.currentLine.set({
          x2: pointer.x,
          y2: pointer.y,
        });
        this.connectionManager.currentLine.setCoords();

        // check if need show Target points

        // Determine the closest target node (if any) under the pointer, ignoring the source.
        let closestTarget = null;
        let minDist = Infinity;
        this.items.forEach(({ node }) => {
          if (
            this.connectionManager.connectionStartCircle &&
            node ===
              this.connectionManager.connectionStartCircle.sideConnectionPoints
                .item.node
          )
            return;
          if (
            isInsideTargetZone(
              pointer,
              node,
              SpaceToConnectionPointCenter + ConnectionPointDiam
            )
          ) {
            // const bounds = node.getBoundingRect();
            // const centerX = bounds.left + bounds.width / 2;
            // const centerY = bounds.top + bounds.height / 2;
            // const dist = Math.hypot(pointer.x - centerX, pointer.y - centerY);
            const center = getCenter(node);
            const dist = getDistance(pointer, center);
            if (dist < minDist) {
              minDist = dist;
              closestTarget = node;
            }
          }
        });

        if (
          closestTarget &&
          !this.connectionManager.targetSideConnectionPoints
          //?.connectionPointsElements?.length === 0
        ) {
          // this.currentTargetBluePoints =
          // this.showTargetConnectionPoints(closestTarget);
          this.connectionManager.showTargetConnectionPoints(
            closestTarget.flowchartItem
          );
        } else if (
          !closestTarget &&
          this.connectionManager.targetSideConnectionPoints
          // ?.connectionPointsElements?.length > 0
        ) {
          this.connectionManager.hideTargetConnectionPoints();
        }

        this.canvas.requestRenderAll();
      }
    });
  }

  // TODO rework it. we need support 4 points
  connectItems(fromItem, toItem) {
    // Find the closest blue connection point on the target node.
    const closestPoint = findClosestBluePoint(toItem.node);

    if (!closestPoint) {
      console.warn("No valid connection point found.");
      return;
    }

    // Create a temporary line.
    const tempLine = new Line(
      [
        fromItem.left + 60,
        fromItem.top + 30,
        closestPoint.left,
        closestPoint.top,
      ],
      {
        stroke: "black",
        strokeWidth: 2,
        selectable: false,
      }
    );
    this.canvas.add(tempLine);

    // Use the FlowchartConnection class to finalize the connection.
    new FlowchartConnection(this, fromItem, toItem, tempLine, closestPoint);
  }
}

// A helper used by node events to check if the pointer is over one of the node's children.
// TODO rethink
// isHoveringOverChild(node, event) {
//   const pointer = this.canvas.getPointer(event.e);
//   return (node.connectionPoints || []).some((cp) => {
//     const bounds = cp.getBoundingRect();
//     return (
//       pointer.x >= bounds.left &&
//       pointer.x <= bounds.left + bounds.width &&
//       pointer.y >= bounds.top &&
//       pointer.y <= bounds.top + bounds.height
//     );
//   });
// }

// this.canvas.on("mouse:down", (event) => {
//   const target = this.canvas.findTarget(event.e); // Get clicked object
//   this.canvas.bringObjectForward(target);

//   // if (target && target.type === "circle") {
//   //   console.log("Clicked on a node:", target);
//   //   target.set({ fill: "blue" });
//   //   this.canvas.renderAll();
//   // }
// });

// -----

// const objectsBelowMouse =
//   // this.canvas
//   // .getObjects()
//   // .reverse()
//   [...targets]
//     .filter((obj) => obj.containsPoint(pointer))
//     .map((obj) => ({
//       group: obj._objects,
//       groupText: obj._objects?.map((item) =>
//         [item.text, item.type].join(", ")
//       ),
//       type: obj.type,
//       text: obj.text,
//       left: obj.left,
//       top: obj.top,
//       width: obj.width || null,
//       height: obj.height || null,
//       radius: obj.radius || null, // Only for circles
//       fill: obj.fill,
//       stroke: obj.stroke,
//       opacity: obj.opacity,
//     }));
// if (objectsBelowMouse.length > 0) {
//   // console.log("Objects below mouse:");
//   console.dir(objectsBelowMouse);
//   console.log(objectsBelowMouse[0].groupText);
// }

// TODO rethink

// onMouseOut(e) {
//   // TODO add cancellation if then mouse in again
//   setTimeout(() => {
//     // TODO WARN Recheck isHoveringOverChild !!
//     // in preogress
//     if (!this.manager.isHoveringOverChild(this.node, e)) {
//       this.manager.connectionManager.hideStartConnectionPoints();
//     }
//   }, 200);
// }

// onMoving() {
//   this.manager.connectionManager.hideStartConnectionPoints();
//   this.manager.connectionManager.hideTargetConnectionPoints();
// }

// onMouseover() {
//   console.log("FlowchartItem show start ConnectionPoints this.item=", this);
//   // TODO pass down node to get its connections point coordinates
//   this.manager.connectionManager.showStartConnectionPoints(this);
// }

// Show blue connection circles on the target node.
// showTargetConnectionPoints(node) {
// const bounds = node.getBoundingRect();
// const positions = [
//   { x: bounds.left + bounds.width / 2, y: bounds.top },
//   { x: bounds.left, y: bounds.top + bounds.height / 2 },
//   { x: bounds.left + bounds.width, y: bounds.top + bounds.height / 2 },
//   { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height },
// ];
// let bluePoints = [];
// positions.forEach((pt) => {
//   const blueCircle = new Circle({
//     left: pt.x,
//     top: pt.y,
//     radius: 5,
//     fill: "blue",
//     selectable: false,
//     evented: false,
//     originX: "center",
//     originY: "center",
//     // stroke: "black",
//     // strokeWidth: 1,
//   });
//   // Hover animation
//   // blueCircle.on("mouseover", () => {
//   //   blueCircle.set({
//   //     radius: 7, // Slightly increase size
//   //     fill: "white", // Make it just a border
//   //   });
//   //   blueCircle.canvas.renderAll(); // Update canvas
//   // });
//   // blueCircle.on("mouseout", () => {
//   //   blueCircle.set({
//   //     radius: 5, // Restore original size
//   //     fill: "yellow", // Restore original fill
//   //   });
//   //   blueCircle.canvas.renderAll();
//   // });
//   this.canvas.add(blueCircle);
//   bluePoints.push(blueCircle);
// });
// return bluePoints;
// }

// Remove blue connection indicators.
// removeTargetConnectionPoints() {
//   this.currentTargetBluePoints?.forEach((p) => this.canvas.remove(p));
//   this.currentTargetBluePoints = [];
// }
