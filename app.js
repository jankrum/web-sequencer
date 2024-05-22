import { getSetlist } from "./utility.js";
import mediate from "./mediate.js";
import Leader from './leader.js';  // Leads the band
import Transporter from './transporter.js';  // Controls playback
// import getConnection from './get-connection.js';  // Used to get midi connections
// import Controller from './controller.js';  // Used to make the controller

const leader = new Leader(await getSetlist());
const transporter = new Transporter(document.querySelector('#transporter'));
mediate(leader, transporter);

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

// console.log('%cReady!', 'background-color: green; color: white;');