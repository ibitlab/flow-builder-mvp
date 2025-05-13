import { FlowchartConnection } from "./FlowchartConnection.js";
import { FlowchartSideConnectionPoints } from "./FlowchartSideConnectionPoints.js";
import { ItemBehaviorType } from "./FlowchartSideConnectionPointsUtils.js";
import { getAngleBetweenPoints } from "./utils.js";

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

  addConnection(fromNode, targetNode, line, targetPoint) {
    // TODO remove line, it should be created based on start/end points
    const conn = new FlowchartConnection(
      fromNode,
      targetNode,
      line,
      targetPoint
    );

    // TODO create methods for canvas, wrapper
    this.manager.canvas.add(conn.arrow);
    // Todo check why do not work
    this.manager.canvas.sendObjectToBack(conn.arrow);
    // Save the connection.
    this.connections.push(conn);
  }

  updateConnections(movedObject) {
    // TODO add support edge connections
    this.connections.forEach((conn) => {
      if (conn.from === movedObject || conn.to === movedObject) {
        conn.line.set({
          x1: conn.from.left + 60,
          y1: conn.from.top + 30,
          x2: conn.to.left + 60,
          y2: conn.to.top + 30,
        });
        conn.line.setCoords();
        // Update arrow position.
        conn.arrow.set({
          left: conn.to.left + 60,
          top: conn.to.top + 30,
          angle: getAngleBetweenPoints(conn.from, conn.to),
        });
        conn.arrow.setCoords();
      }
    });
    this.manager.canvas.requestRenderAll();
  }

  showStartConnectionPoints(item) {
    // console.error("showStartConnectionPoints");
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
    // console.error("showTargetConnectionPoints");
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
