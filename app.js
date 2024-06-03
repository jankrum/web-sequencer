// // Imports
// import Transporter from './transporter.js';
// import Controller from './controller.js';
// import Leader from './leader.js';
// import mediate from "./mediate.js";

// // Create the transporter, controller, and leader
// const transporter = new Transporter();
// const transporterDiv = document.querySelector('#transporter');
// transporter.start(transporterDiv);

// const controller = new Controller();
// const controllerDiv = document.querySelector('#controller');
// controller.start(controllerDiv, 1);

// const leader = new Leader();

// // Mediate the transporter, controller, and leader
// mediate(transporter, controller, leader);

// // Start the leader
// await leader.start();

// console.log('%cReady!', 'background-color: green; color: white;');

import getBand from './make-band.js';

const band = await getBand();
console.log(band);