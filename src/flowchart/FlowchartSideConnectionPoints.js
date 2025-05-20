import { ItemBehaviorType } from "../constants/constants.js";
import { createCircle } from "../fabric-components/fabricUtils.js";

export class FlowchartSideConnectionPoints {
  constructor(connectionManager, item, itemBehaviorType) {
    this.manager = connectionManager.manager;
    this.itemBehaviorType = itemBehaviorType;
    this.item = item;
    this.connectionPointsElements = [];

    this.initConnectionPoints();
  }

  isTarget() {
    return this.itemBehaviorType === ItemBehaviorType.TARGET;
  }

  destroy() {
    this.hideConnectionPoints();
  }

  initConnectionPoints() {
    const positions = this.item.connectionEdges;
    positions.forEach((pt) => {
      const circle = createCircle(pt);

      circle.edge = pt.edge;
      circle.sideConnectionPoints = this;

      this.manager.canvas.add(circle);
      this.connectionPointsElements.push(circle);
    });
  }

  // Remove (hide) all connection circles from this node.
  hideConnectionPoints() {
    if (this.connectionPointsElements) {
      this.connectionPointsElements.forEach((cp) =>
        this.manager.canvas.remove(cp)
      );
      this.connectionPointsElements = [];
    }
  }
}
