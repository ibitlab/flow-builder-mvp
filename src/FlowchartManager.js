import {
  Canvas,
  Rect,
  FabricText,
  Line,
  Circle,
  Triangle,
  Group,
} from "fabric";

const chartDefaultConfig = {
  selection: true,
  subTargetCheck: true,
  backgroundColor: "#f0f0f0",
  width: 800,
  height: 500,
};

export class FlowchartManager {
  constructor(canvasId, config = {}) {
    // Initialize Fabric canvas using a config object to centralize settings.
    this.canvas = new Canvas(
      canvasId,
      Object.assign(chartDefaultConfig, config)
    );

    console.log("this.canvas=", this.canvas);

    // State arrays.
    this.nodes = [];
    this.connections = [];

    // Variables for interactive connections.
    this.currentLine = null;
    this.connectionStartCircle = null;
    this.currentTargetBluePoints = [];
    this.animationFrameId = null;

    // Bind event handlers for updating during dragging.
    this.canvas.on("mouse:move", (e) => this.onMouseMove(e));
    this.canvas.on("mouse:up", (e) => this.onMouseUp(e));
    this.canvas.on("object:moving", (e) => this.onObjectMoving(e));
  }

  onObjectMoving(event) {
    console.log("Item movement");
    const movedObject = event.target;
    this.updateConnections(movedObject);
  }

  updateConnections(movedObject) {
    this.connections.forEach((conn) => {
      if (conn.from === movedObject || conn.to === movedObject) {
        conn.line.set({
          x1: conn.from.left + 60,
          y1: conn.from.top + 30,
          x2: conn.to.left + 60,
          y2: conn.to.top + 30,
        });
        conn.line.setCoords();

        // Update arrow position
        conn.arrow.set({
          left: conn.to.left + 60,
          top: conn.to.top + 30,
          angle:
            Math.atan2(
              conn.to.top - conn.from.top,
              conn.to.left - conn.from.left
            ) *
              (180 / Math.PI) +
            90,
        });
        conn.arrow.setCoords();
      }
    });
    this.canvas.renderAll();
  }

  // Create a node (group of a rectangle and a centered text label).
  createNode(text, left, top) {
    const rect = new Rect({
      width: 120,
      height: 60,
      fill: "lightblue",
      stroke: "black",
      strokeWidth: 2,
      rx: 10, // Rounded corners
      ry: 10,
    });

    // Create a text label and manually offset it to the center of the rect.
    const label = new FabricText(text, {
      fontSize: 16,
      fill: "black",
      originX: "center",
      originY: "center",
      left: rect.width / 2,
      top: rect.height / 2,
    });

    // Group the rectangle and text.
    const node = new Group([rect, label], {
      left,
      top,
      selectable: true,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
      hasControls: false,
      subTargetCheck: true, // Allows child objects (e.g. connection circles) to receive events.
    });

    // When hovering, show the red connection circles.
    node.on("mouseover", () => {
      this.showConnectionPoints(node);
    });

    // On mouse out, hide them—but only if the mouse isn’t over one of the connection points.
    node.on("mouseout", (e) => {
      setTimeout(() => {
        if (!this.isHoveringOverChild(node, e)) {
          this.hideConnectionPoints(node);
        }
      }, 200);
    });

    // Hide connection points when dragging.
    node.on("moving", () => {
      this.hideConnectionPoints(node);
    });

    // Add node to canvas and state.
    this.canvas.add(node);
    this.nodes.push(node);
    return node;
  }

  connectNodes(from, to) {
    const line = new Line(
      [from.left + 60, from.top + 30, to.left + 60, to.top + 30],
      {
        stroke: "black",
        strokeWidth: 2,
        selectable: false,
      }
    );

    // Calculate arrowhead position and rotation
    const angle =
      Math.atan2(to.top - from.top, to.left - from.left) * (180 / Math.PI);

    const arrow = new Triangle({
      left: to.left + 60,
      top: to.top + 30,
      width: 12,
      height: 16,
      fill: "black",
      angle: angle + 90, // Adjust to align with the line direction
      originX: "center",
      originY: "center",
    });

    this.canvas.add(line, arrow);
    this.connections.push({ from, to, line, arrow });
  }

  // Display red connection circles on the node’s edges.
  showConnectionPoints(node) {
    // Remove any existing connection points.
    this.hideConnectionPoints(node);
    const bounds = node.getBoundingRect();

    // Compute positions for top, left, right, bottom.
    const positions = [
      { x: bounds.left + bounds.width / 2, y: bounds.top, edge: "top" },
      { x: bounds.left, y: bounds.top + bounds.height / 2, edge: "left" },
      {
        x: bounds.left + bounds.width,
        y: bounds.top + bounds.height / 2,
        edge: "right",
      },
      {
        x: bounds.left + bounds.width / 2,
        y: bounds.top + bounds.height,
        edge: "bottom",
      },
    ];

    node.connectionPoints = [];
    positions.forEach((pt) => {
      const circle = new Circle({
        left: pt.x,
        top: pt.y,
        radius: 5,
        fill: "red",
        stroke: "black",
        strokeWidth: 1,
        selectable: false, // Prevent dragging/selection
        evented: true, // Allow clicks to start a connection arrow.
        originX: "center",
        originY: "center",
      });
      circle.edge = pt.edge;
      circle.nodeParent = node;

      // When mousedown on a red circle, stop other events and begin drawing a connection.
      circle.on("mousedown", (e) => {
        e.e.stopPropagation();
        // Temporarily disable the node’s selectability.
        circle.nodeParent.selectable = false;
        this.canvas.selection = false;
        this.connectionStartCircle = circle;

        const pointer = this.canvas.getPointer(e.e);
        this.currentLine = new Line(
          [pointer.x, pointer.y, pointer.x, pointer.y],
          {
            stroke: "black",
            strokeWidth: 2,
            selectable: false,
          }
        );
        this.canvas.add(this.currentLine);
      });

      // Prevent the red circle from stealing focus.
      circle.on("mouseover", (e) => {
        e.e.stopPropagation();
        this.canvas.discardActiveObject();
        this.canvas.requestRenderAll();
      });

      this.canvas.add(circle);
      node.connectionPoints.push(circle);
    });
  }
  // Remove all red connection circles from a node.
  hideConnectionPoints(node) {
    if (node.connectionPoints) {
      node.connectionPoints.forEach((cp) => this.canvas.remove(cp));
      node.connectionPoints = [];
    }
  }

  // Check if, at mouseout, the pointer is over one of the node’s child connection points.
  isHoveringOverChild(node, event) {
    const pointer = this.canvas.getPointer(event.e);
    return (node.connectionPoints || []).some((cp) => {
      const bounds = cp.getBoundingRect();
      return (
        pointer.x >= bounds.left &&
        pointer.x <= bounds.left + bounds.width &&
        pointer.y >= bounds.top &&
        pointer.y <= bounds.top + bounds.height
      );
    });
  }

  // Update events during mouse move.
  onMouseMove(e) {
    const pointer = this.canvas.getPointer(e.e);

    // Update the drawn connection line using requestAnimationFrame for smoother performance.
    if (this.currentLine) {
      if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = requestAnimationFrame(() => {
        this.currentLine.set({ x2: pointer.x, y2: pointer.y });
        this.currentLine.setCoords();
        this.canvas.requestRenderAll();
      });
    }

    // Look for a target node (closest one) under the pointer (ignoring the source node).
    let closestTarget = null;
    let minDist = Infinity;
    this.nodes.forEach((node) => {
      if (
        this.connectionStartCircle &&
        node === this.connectionStartCircle.nodeParent
      )
        return;
      if (this.isInsideTargetZone(pointer, node)) {
        const bounds = node.getBoundingRect();
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;
        const dist = Math.hypot(pointer.x - centerX, pointer.y - centerY);
        if (dist < minDist) {
          minDist = dist;
          closestTarget = node;
        }
      }
    });

    if (closestTarget && this.currentTargetBluePoints.length === 0) {
      this.currentTargetBluePoints =
        this.showTargetConnectionPoints(closestTarget);
    } else if (!closestTarget && this.currentTargetBluePoints.length > 0) {
      this.removeTargetConnectionPoints(this.currentTargetBluePoints);
      this.currentTargetBluePoints = [];
    }
  }

  // Finalize the connection on mouse up.
  onMouseUp(e) {
    if (this.currentLine) {
      const pointer = this.canvas.getPointer(e.e);
      let targetNode = null;

      // Identify a target node (if any) where the pointer is.
      this.nodes.forEach((node) => {
        if (
          this.connectionStartCircle &&
          node === this.connectionStartCircle.nodeParent
        )
          return;
        if (this.isInsideTargetZone(pointer, node)) {
          targetNode = node;
        }
      });

      if (targetNode && this.currentTargetBluePoints.length > 0) {
        // Find the closest blue point to the pointer.
        let closestPoint = null;
        let minDist = Infinity;
        this.currentTargetBluePoints.forEach((bp) => {
          const dx = bp.left - pointer.x;
          const dy = bp.top - pointer.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDist) {
            minDist = dist;
            closestPoint = bp;
          }
        });

        if (closestPoint) {
          // Snap line end to the closest blue point.
          this.currentLine.set({
            x2: closestPoint.left,
            y2: closestPoint.top,
          });
          this.currentLine.setCoords();

          // Create the arrowhead.
          const angle =
            (Math.atan2(
              this.currentLine.y2 - this.currentLine.y1,
              this.currentLine.x2 - this.currentLine.x1
            ) *
              180) /
              Math.PI +
            90;
          const arrow = new Triangle({
            left: closestPoint.left,
            top: closestPoint.top,
            width: 12,
            height: 16,
            fill: "black",
            originX: "center",
            originY: "center",
            angle: angle,
            selectable: false,
          });
          this.canvas.add(arrow);

          // Save the connection info.
          this.connections.push({
            from: this.connectionStartCircle.nodeParent,
            to: targetNode,
            line: this.currentLine,
            arrow: arrow,
          });
        }
      } else {
        // No valid target found: remove the temporary line.
        this.canvas.remove(this.currentLine);
      }

      // Clean up blue connection points.
      if (this.currentTargetBluePoints.length > 0) {
        this.removeTargetConnectionPoints(this.currentTargetBluePoints);
        this.currentTargetBluePoints = [];
      }
      // Re-enable selection on the source node.
      if (this.connectionStartCircle && this.connectionStartCircle.nodeParent) {
        this.connectionStartCircle.nodeParent.selectable = true;
      }
      this.canvas.selection = true;

      // Clear temporary connection state.
      this.currentLine = null;
      this.connectionStartCircle = null;
      this.canvas.requestRenderAll();
    }
  }
  // Check if the pointer is inside a node’s (expanded) target zone.
  isInsideTargetZone(pointer, node) {
    const bounds = node.getBoundingRect();
    const padding = 20; // Increase this value to expand detection zone.
    return (
      pointer.x >= bounds.left - padding &&
      pointer.x <= bounds.left + bounds.width + padding &&
      pointer.y >= bounds.top - padding &&
      pointer.y <= bounds.top + bounds.height + padding
    );
  }

  // Display blue connection circles on the target node.
  showTargetConnectionPoints(node) {
    const bounds = node.getBoundingRect();
    const positions = [
      { x: bounds.left + bounds.width / 2, y: bounds.top },
      { x: bounds.left, y: bounds.top + bounds.height / 2 },
      {
        x: bounds.left + bounds.width,
        y: bounds.top + bounds.height / 2,
      },
      {
        x: bounds.left + bounds.width / 2,
        y: bounds.top + bounds.height,
      },
    ];

    let bluePoints = [];
    positions.forEach((pt) => {
      const blueCircle = new Circle({
        left: pt.x,
        top: pt.y,
        radius: 5,
        fill: "blue",
        selectable: false,
        evented: false,
        originX: "center",
        originY: "center",
      });
      this.canvas.add(blueCircle);
      bluePoints.push(blueCircle);
    });
    return bluePoints;
  }

  // Remove blue circles from the canvas.
  removeTargetConnectionPoints(points) {
    points.forEach((p) => this.canvas.remove(p));
  }
}
