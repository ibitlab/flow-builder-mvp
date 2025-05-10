import { FlowchartManager } from "./FlowchartManager.js";

const chartConfig = {
  backgroundColor: "#f0f0f0",
  width: 800,
  height: 500,
};
const flowchart = new FlowchartManager("canvasFlow", chartConfig);

const startNode = flowchart.createItem("Start", 100, 100);
const processNode = flowchart.createItem("Process", 300, 100);
const endNode = flowchart.createItem("End", 500, 100);

flowchart.connectNodes(startNode, processNode);
flowchart.connectNodes(processNode, endNode);
