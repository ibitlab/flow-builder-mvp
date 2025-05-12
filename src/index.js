import "./global.css";
import { FlowchartManager } from "./FlowchartManager.js";

const chartConfig = {
  backgroundColor: "#f0f0f0",
  width: 800,
  height: 500,
};
const flowchart = new FlowchartManager("canvasFlow", chartConfig);

const startItem = flowchart.createItem("Start", 100, 100);
const processItem = flowchart.createItem("Process", 300, 100);
const endItem = flowchart.createItem("End", 500, 100);

flowchart.connectItems(startItem, processItem);
flowchart.connectItems(processItem, endItem);
