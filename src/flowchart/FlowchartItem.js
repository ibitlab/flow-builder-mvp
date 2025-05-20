import { SpaceToConnectionPointCenter } from "../constants/constants.js";
import { createNode } from "../fabric-components/fabricUtils.js";
import { getEdgePositions } from "../utils/utils.js";

export class FlowchartItem {
  constructor(id, text, type, left, top, width, height) {
    if (!id) {
      throw new Error("Item ID is required");
    }
    this.id = id;
    this.node = createNode(text, type, left, top, width, height);
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
