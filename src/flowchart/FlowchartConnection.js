import { createConnectionElements } from "../fabric-components/fabricUtils.js";
import { getAngleBetweenPoints } from "../utils/utils.js";

export class FlowchartConnection {
  constructor(fromItem, toItem, fromEdge, toEdge) {
    this.fromItem = fromItem;
    this.toItem = toItem;
    this.fromEdge = fromEdge;
    this.toEdge = toEdge;

    // TODO extract this into utils
    const fromEdgePosition = this.fromItem.connectionEdges?.find(
      (item) => item.edge === this.fromEdge
    );
    const toEdgePosition = this.toItem.connectionEdges?.find(
      (item) => item.edge === this.toEdge
    );

    createConnectionElements(this, fromEdgePosition, toEdgePosition);
  }

  updateConnectionElementsPositions() {
    // TODO extract this into utils
    const fromEdgePosition = this.fromItem.connectionEdges?.find(
      (item) => item.edge === this.fromEdge
    );
    const toEdgePosition = this.toItem.connectionEdges?.find(
      (item) => item.edge === this.toEdge
    );

    this.updateConnectionElements(fromEdgePosition, toEdgePosition);
  }

  updateConnectionElements(fromEdgePosition, toEdgePosition) {
    this.line.set({
      x1: fromEdgePosition.x,
      y1: fromEdgePosition.y,
      x2: toEdgePosition.x,
      y2: toEdgePosition.y,
    });
    this.line.setCoords();

    const angle = getAngleBetweenPoints(
      { x: fromEdgePosition.x, y: fromEdgePosition.y },
      { x: toEdgePosition.x, y: toEdgePosition.y }
    );

    this.arrow.set({
      left: toEdgePosition.x,
      top: toEdgePosition.y,
      angle: angle,
    });
    this.arrow.setCoords();
  }
}
