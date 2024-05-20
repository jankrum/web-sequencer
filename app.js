import getConnection from './get-connection.js';  // Used to get midi connections
import Controller from './controller.js';  // Used to make the controller
import Leader from './leader.js';  // Leads the band

// Get the output to the synthesizer
const synthesizerOutput = await getConnection('synthesizer', 'outputs');

// Create the controller
const controllerDiv = document.querySelector('#controller');
const synthesizerController = new Controller(controllerDiv, false, 1);

// Create the leader
const leader = new Leader(
    document.querySelector('#play-button'),
    document.querySelector('#pause-button'),
    document.querySelector('#resume-button'),
    document.querySelector('#stop-button')
);

// Create the part
leader.createPart(synthesizerOutput, synthesizerController);

// Load the chart and script
const chart = await fetch('./static/on-the-run.json').then(response => response.json());
const script = await fetch('./static/repeater.js').then(response => response.text());
await leader.load(chart, script);

console.log('%cReady!', 'background-color: green; color: white;');