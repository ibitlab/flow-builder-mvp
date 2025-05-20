import "./styles/global.css";
import { FlowchartManager } from "./flowchart/FlowchartManager.js";
import { Edge } from "./constants/constants.js";

const chartConfig = {
  backgroundColor: "#f0f0f0",
  width: 800,
  height: 500,
};
const flowchart = new FlowchartManager("canvasFlow", chartConfig);

const startItem = flowchart.createItem(null, "Start ", 100, 100);
const processItem = flowchart.createItem(null, "Process", 300, 100);
const endItem = flowchart.createItem(null, "End", 500, 100);
flowchart.createItem(null, "Symbol1 🗄️", 500, 100);

flowchart.connectItems(startItem, processItem, Edge.BOTTOM, Edge.TOP);
flowchart.connectItems(processItem, endItem, Edge.BOTTOM, Edge.TOP);

window.add1 = () => {
  console.log(JSON.stringify(flowchart.canvas.toJSON()));
};
