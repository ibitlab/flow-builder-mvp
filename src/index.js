import "./styles/global.css";
import {
  FlowchartManager,
  LoadItemsFromJSON,
} from "./flowchart/FlowchartManager.js";

// import orderProcessingFlow from "../public/test-data/order-processing-flow.json";
// import userAuthFlow from "../public/test-data/user-auth-flow.json";
// import debuggingFrontEndIssue from "../public/test-data/debugging-front-end-issue.json";
import memeDecisionFlow from "../public/test-data/meme-decision-flow.json";

const chartConfig = {
  backgroundColor: "#f0f0f0",
  width: 1800,
  height: 1500,
};
const flowchart = new FlowchartManager("canvasFlow", chartConfig);

LoadItemsFromJSON(flowchart, memeDecisionFlow);

window.add1 = () => {
  console.log(JSON.stringify(flowchart.canvas.toJSON()));
};
