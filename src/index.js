import "./styles/global.css";
import {
  FlowchartManager,
  LoadItemsFromJSON,
} from "./flowchart/FlowchartManager.js";

// import flow1 from "../public/test-data/flow1.json";
import userAuthFlow from "../public/test-data/user-auth-flow.json";

console.log(userAuthFlow);

const chartConfig = {
  backgroundColor: "#f0f0f0",
  width: 1800,
  height: 1500,
};
const flowchart = new FlowchartManager("canvasFlow", chartConfig);

LoadItemsFromJSON(flowchart, userAuthFlow);

// const startItem = flowchart.createItem(null, "Start 🗄️", 100, 100);
// const orderReceived = flowchart.createItem(null, "Order Received 📦", 300, 100);
// const paymentVerification = flowchart.createItem(
//   null,
//   "Payment Verified 💰",
//   500,
//   100
// );
// const fraudCheck = flowchart.createItem(null, "Fraud Check 🔍", 500, 250);
// const fraudDetected = flowchart.createItem(null, "Fraud Detected 🚨", 500, 400);
// const notifySecurity = flowchart.createItem(
//   null,
//   "Notify Security 🚔",
//   700,
//   400
// );

// const stockCheck = flowchart.createItem(null, "Check Stock 🏪", 700, 100);
// const stockAvailable = flowchart.createItem(
//   null,
//   "Stock Available ✅",
//   900,
//   100
// );
// const stockUnavailable = flowchart.createItem(
//   null,
//   "Stock Unavailable ❌",
//   900,
//   250
// );
// const notifyCustomer = flowchart.createItem(
//   null,
//   "Notify Customer ✉️",
//   1100,
//   250
// );

// const processShipment = flowchart.createItem(
//   null,
//   "Process Shipment 🚚",
//   1100,
//   100
// );
// const shipmentSent = flowchart.createItem(null, "Shipment Sent 📤", 1300, 100);
// const orderComplete = flowchart.createItem(
//   null,
//   "Order Complete 🏁",
//   1500,
//   100
// );

// const refundProcess = flowchart.createItem(null, "Refund Process 🔄", 700, 550);
// const customerSupport = flowchart.createItem(
//   null,
//   "Customer Support 📞",
//   900,
//   550
// );
// const issueResolved = flowchart.createItem(
//   null,
//   "Issue Resolved ✔️",
//   1100,
//   550
// );

// // **Updated Connections**
// flowchart.connectItems(startItem, orderReceived, Edge.RIGHT, Edge.LEFT);
// flowchart.connectItems(
//   orderReceived,
//   paymentVerification,
//   Edge.RIGHT,
//   Edge.LEFT
// );
// flowchart.connectItems(paymentVerification, stockCheck, Edge.RIGHT, Edge.LEFT);
// flowchart.connectItems(stockCheck, stockAvailable, Edge.RIGHT, Edge.LEFT);
// flowchart.connectItems(stockCheck, stockUnavailable, Edge.BOTTOM, Edge.TOP);
// flowchart.connectItems(stockUnavailable, notifyCustomer, Edge.RIGHT, Edge.LEFT);
// flowchart.connectItems(stockAvailable, processShipment, Edge.RIGHT, Edge.LEFT);
// flowchart.connectItems(processShipment, shipmentSent, Edge.RIGHT, Edge.LEFT);
// flowchart.connectItems(shipmentSent, orderComplete, Edge.RIGHT, Edge.LEFT);

// flowchart.connectItems(paymentVerification, fraudCheck, Edge.BOTTOM, Edge.TOP);
// flowchart.connectItems(fraudCheck, fraudDetected, Edge.BOTTOM, Edge.TOP);
// flowchart.connectItems(fraudDetected, notifySecurity, Edge.RIGHT, Edge.LEFT);
// flowchart.connectItems(notifySecurity, refundProcess, Edge.BOTTOM, Edge.TOP);
// flowchart.connectItems(refundProcess, customerSupport, Edge.RIGHT, Edge.LEFT);
// flowchart.connectItems(customerSupport, issueResolved, Edge.RIGHT, Edge.LEFT);

window.add1 = () => {
  console.log(JSON.stringify(flowchart.canvas.toJSON()));
};
