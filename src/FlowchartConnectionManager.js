import { FlowchartConnection } from "./FlowchartConnection.js";
import { getAngleBetweenPoints } from "./utils.js";

export class FlowchartConnectionManager {
  constructor(manager) {
    this.manager = manager;
    this.connections = [];
  }

  attachEvents() {}

  destroy() {}

  addConnection(fromNode, targetNode, line, targetBluePoint) {
    // TODO remove line, it should be created based on start/end points
    const conn = new FlowchartConnection(
      fromNode,
      targetNode,
      line,
      targetBluePoint
    );

    // TODO create methods for canvas, wrapper
    this.manager.canvas.add(conn.arrow);
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
}
