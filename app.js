import mediate from "./mediate.js";
import Leader from './leader.js';
import Transporter from './transporter.js';

const transporterDiv = document.querySelector('#transporter');
const transporter = new Transporter(transporterDiv);

const controllerDiv = document.querySelector('#controller');
const controller = new Controller(controllerDiv, false, 1);

const leader = new Leader();

mediate(leader, transporter);

await leader.start();

console.log('%cReady!', 'background-color: green; color: white;');

// // Get the output to the synthesizer
// const synthesizerOutput = await getConnection('synthesizer', 'outputs');

// // Create the controller
// const controllerDiv = document.querySelector('#controller');
// const synthesizerController = new Controller(controllerDiv, false, 1);


// // Create the part
// leader.createPart(synthesizerOutput, synthesizerController);

// // Load the chart and script
// const chart = await fetch('./static/on-the-run.json').then(response => response.json());
// const script = await fetch('./static/repeater.js').then(response => response.text());

// leader.load(chart, script);
