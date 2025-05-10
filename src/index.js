import { FlowchartManager } from "./FlowchartManager.js";

const chartConfig = {
  backgroundColor: "#f0f0f0",
  width: 800,
  height: 500,
};
const flowchart = new FlowchartManager("canvasFlow", chartConfig);

const startNode = flowchart.createNode("Start", 100, 100);
const processNode = flowchart.createNode("Process", 300, 100);
const endNode = flowchart.createNode("End", 500, 100);

flowchart.connectNodes(startNode, processNode);
flowchart.connectNodes(processNode, endNode);
