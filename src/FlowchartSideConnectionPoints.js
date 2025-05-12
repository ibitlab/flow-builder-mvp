import {
  createCircle,
  createLine,
  ItemBehaviorType,
} from "./FlowchartSideConnectionPointsUtils.js";

export class FlowchartSideConnectionPoints {
  constructor(connectionManager, item, itemBehaviorType) {
    this.manager = connectionManager.manager;
    this.itemBehaviorType = itemBehaviorType;
    this.item = item;
    console.log("FlowchartSideConnectionPoints item=", item, itemBehaviorType);
    this.connectionPointsElements = [];

    // // rethink this
    // this.connectionStartCircle = null;
    // this.currentLine = null;
  }

  isTarget() {
    return this.itemBehaviorType === ItemBehaviorType.TARGET;
  }

  destroy() {
    this.hideConnectionPoints();
  }

  // Create and show START/Target(TODO) connection circles along the node’s edges.
  initConnectionPoints() {
    // TODO points should be get from item points
    // const bounds = this.item.node.getBoundingRect();
    // Define positions for top, left, right, and bottom.
    console.log("showConnectionPoints this.item=", this.item);
    const positions = this.item.connectionPoints; // getEdgePositions12323(bounds);
    console.log("showConnectionPoints positions=", positions);
    positions.forEach((pt) => {
      const circle = createCircle(pt);
      console.log("showConnectionPoints positions.forEach=", pt);

      circle.edge = pt.edge;
      // circle.nodeParent = this.item.node;
      circle.sideConnectionPoints = this;

      // // When you press down on the start circle, start a connection.
      // // TODO move this logic out?
      // if (!this.isTarget()) {
      //   circle.on("mousedown", (e) => {
      //     console.log("showConnectionPoints mousedown");
      //     e.e.stopPropagation();
      //     // Temporarily disable node dragging.
      //     circle.sideConnectionPoints.item.node.selectable = false;
      //     this.manager.canvas.selection = false;
      //     // Tell the manager which connection point we started at.
      //     this.manager.connectionManager.connectionStartCircle = circle;
      //     const pointer = this.manager.canvas.getPointer(e.e);
      //     this.manager.connectionManager.currentLine = createLine(pointer);
      //     console.log(
      //       "showConnectionPoints currentLine=",
      //       this.manager.connectionManager.currentLine
      //     );
      //     this.manager.canvas.add(this.manager.connectionManager.currentLine);
      //   });

      //   // Prevent the red circle from stealing focus.
      //   // TODO review
      //   // circle.on("mouseover", (e) => {
      //   //   e.e.stopPropagation();
      //   //   this.manager.canvas.discardActiveObject();
      //   //   this.manager.canvas.requestRenderAll();
      //   // });
      // }

      this.manager.canvas.add(circle);
      this.connectionPointsElements.push(circle);
    });
  }

  // Remove (hide) all red connection circles from this node.
  hideConnectionPoints() {
    if (this.connectionPointsElements) {
      this.connectionPointsElements.forEach((cp) =>
        this.manager.canvas.remove(cp)
      );
      this.connectionPointsElements = [];
    }
  }

  handlerStartCircleMouseDown(connectionCircle, pointer) {
    // When you press down on the start circle, start a connection.
    // if (!this.isTarget()) {
    // Temporarily disable node dragging.
    this.item.node.selectable = false;
    this.manager.canvas.selection = false;
    // Tell the manager which connection point we started at.
    this.manager.connectionManager.connectionStartCircle = connectionCircle;
    this.manager.connectionManager.currentLine = createLine(pointer);
    this.manager.canvas.add(this.manager.connectionManager.currentLine);
    // }
  }
}
