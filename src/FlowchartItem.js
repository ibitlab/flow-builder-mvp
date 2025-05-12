// import { Line, Circle } from "fabric";
import { createNode } from "./fabricUtils.js";
import { getEdgePositions } from "./FlowchartSideConnectionPointsUtils.js";

export class FlowchartItem {
  constructor(text, left, top, manager) {
    // Save a reference to the manager (to access the Fabric canvas, etc.)
    this.manager = manager;

    this.node = createNode(text, 120, 60, left, top);
    // TODO review this
    this.node.flowchartItem = this;

    this.connectionPoints = [];
    this.prepareConnectionPoints();

    // this.onMouseover = this.onMouseover.bind(this);
    // this.onMouseOut = this.onMouseOut.bind(this);
    // this.onMoving = this.onMoving.bind(this);

    this.attachEvents();
  }

  prepareConnectionPoints() {
    // Prepare a property to hold our connection points.
    const bounds = this.node.getBoundingRect();
    // Define positions for top, left, right, and bottom.
    // TODO move out const
    this.connectionPoints = getEdgePositions(bounds, 8);
  }

  attachEvents() {
    // this.node.on("mouseover", this.onMouseover);
    // this.node.on("mouseout", this.onMouseOut);
    // this.node.on("moving", this.onMoving);
  }

  destroy() {
    // this.node.off("mouseover", this.onMouseover);
    // this.node.off("mouseout", this.onMouseOut);
    // this.node.off("moving", this.onMoving);
  }

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
}
