import { ItemBehaviorType } from "../constants/constants.js";
import { FlowchartConnection } from "./FlowchartConnection.js";
import { FlowchartSideConnectionPoints } from "./FlowchartSideConnectionPoints.js";

export class FlowchartConnectionManager {
  constructor(manager) {
    this.manager = manager;
    this.connections = [];

    // rethink this
    this.connectionStartCircle = null;
    this.currentLine = null;

    // init Side connection Points for Start and End Item
    this.startSideConnectionPoints = null;
    this.targetSideConnectionPoints = null;
  }

  attachEvents() {}

  destroy() {}

  addConnection(fromItem, toItem, fromEdge, toEdge) {
    const conn = new FlowchartConnection(fromItem, toItem, fromEdge, toEdge);

    // TODO create methods for canvas, wrapper
    this.manager.canvas.add(conn.line);
    this.manager.canvas.add(conn.arrow);
    this.manager.canvas.sendObjectToBack(conn.line);
    this.manager.canvas.sendObjectToBack(conn.arrow);
    // Save the connection.
    this.connections.push(conn);
  }

  updateConnections() {
    this.connections.forEach((conn) => {
      conn.updateConnectionElementsPositions();
    });
    this.manager.canvas.requestRenderAll();
  }

  showStartConnectionPoints(item) {
    if (this.startSideConnectionPoints) {
      console.error("showStartConnectionPoints on existing starts node");
      this.hideStartConnectionPoints();
    }
    this.startSideConnectionPoints = new FlowchartSideConnectionPoints(
      this,
      item,
      ItemBehaviorType.START
    );
  }

  hideStartConnectionPoints() {
    this.startSideConnectionPoints?.destroy();
    this.startSideConnectionPoints = null;
  }

  showTargetConnectionPoints(item) {
    if (this.targetSideConnectionPoints) {
      console.error("showTargetConnectionPoints on existing targets node");
      this.hideTargetConnectionPoints();
    }
    this.targetSideConnectionPoints = new FlowchartSideConnectionPoints(
      this,
      item,
      ItemBehaviorType.TARGET
    );
  }

  hideTargetConnectionPoints() {
    this.targetSideConnectionPoints?.destroy();
    this.targetSideConnectionPoints = null;
  }
}
