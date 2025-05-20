import { SpaceToConnectionPointCenter } from "../constants/constants.js";
import { createNode } from "../fabric-components/fabricUtils.js";
import { getEdgePositions } from "../utils/utils.js";

export class FlowchartItem {
  constructor(text, left, top) {
    this.node = createNode(text, 120, 60, left, top);
    // TODO review this
    this.node.flowchartItem = this;

    this.connectionEdges = [];

    this.updateConnectionEdges();

    this.onMoving = this.onMoving.bind(this);

    this.attachEvents();
  }

  updateConnectionEdges() {
    // Prepare a property to hold our connection points.
    const bounds = this.node.getBoundingRect();

    this.connectionEdges = getEdgePositions(
      bounds,
      SpaceToConnectionPointCenter
    );
  }

  attachEvents() {
    this.node.on("moving", this.onMoving);
  }

  destroy() {
    this.node.off("moving", this.onMoving);
  }

  onMoving() {
    this.updateConnectionEdges();
  }
}
